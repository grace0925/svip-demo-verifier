import React from 'react'

import JSONPretty from "react-json-pretty";
import * as polyfill from 'credential-handler-polyfill/';
import {Redirect, useHistory} from 'react-router-dom'

import {Button, Col, Container, Row} from 'react-bootstrap'
import {FaWallet} from "react-icons/fa";
import axios from "axios";

class DisplayCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            vc: {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://w3id.org/citizenship/v1"
                ],
                "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
                "type": ["VerifiableCredential", "PermanentResidentCard"],
                "issuer": "did:example:28394728934792387",
                "issuanceDate": "2019-12-03T12:19:52Z",
                "expirationDate": "2029-12-03T12:19:52Z",
                "credentialSubject": {
                    "id": "did:example:b34ca6cd37bbf23",
                    "type": "Person",
                    "givenName": "JOHN",
                    "familyName": "SMITH",
                    "gender": "Male",
                    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                    "residentSince": "2015-01-01",
                    "lprCategory": "C09",
                    "lprNumber": "999-999-999",
                    "commuterClassification": "C1",
                    "birthCountry": "Bahamas",
                    "birthDate": "1958-07-17",
                    "mrzInformation": "IAUSA0000007032SRC0000000703<<\n2001012M1105108BRA<<<<<<<<<<<5\nSPECIMEN<<TEST<VOID<<<<<<<<<<<"
                },
                "proof": {

                },
            },
            finished: false,
        };
        this.installCredHandler = this.installCredHandler.bind(this);
        this.addCredHints = this.addCredHints.bind(this);
        this.requestCredPerm = this.requestCredPerm.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

        (async () => {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
        })();

    }

    async activate(origin) {
        const CredentialHandler = navigator.credentialsPolyfill.CredentialHandler;
        const self = new CredentialHandler(origin)

        self.addEventListener('credentialrequest', this.handleCredentialEvent);
        self.addEventListener('credentialstore', this.handleCredentialEvent);

        await self.connect();
    }

    handleCredentialEvent(event) {
        event.respondWith(new Promise(async (resolve, reject) => {
            // handle request for ID and public key (typical login)
            if(event.type === 'credentialrequest') {
                let query = event.credentialRequestOptions.web.VerifiableProfile;
                query = Object.assign({}, query);
                delete query['@context'];
                if('id' in query && 'publicKey' in query &&
                    Object.keys(query).length === 2) {
                    // cryptokey request, return verifiable profile immediately
                    return resolve({
                        dataType: 'VerifiableProfile',
                        data: {
                            '@context': 'https://w3id.org/identity/v1',
                            id: event.hintKey,
                            // TODO: add public key credential
                            // credential: ...
                        }
                    });
                }
            }

            // handle other requests that require a UI
            let windowClient;
            let listener;
            window.addEventListener('message', listener = e => {
                if(!(e.source === windowClient &&
                    e.origin === window.location.origin)) {
                    return;
                }
                if (e.data.type === 'request') {
                    console.log('sending credential event data to UI window...');
                // send event data to UI window
                return windowClient.postMessage({
                    type: event.type,
                    credentialRequestOrigin: event.credentialRequestOrigin,
                    credentialRequestOptions: event.credentialRequestOptions,
                    credential: event.credential,
                    hintKey: event.hintKey
                }, window.location.origin);
            }
                // this message is final (an error or a response)
                //window.removeEventListener('message', listener);
                if(e.data.type === 'response') {
                    return resolve(e.data.credential);
                }
                // assume e.data is an error
                reject(e.data);
            });

            try {
                console.log('opening app window...');
                windowClient = await event.openWindow('/' + event.type);
                console.log('app window open, waiting for it to request event data...');
            } catch(err) {
                window.removeEventListener('message', listener);
                reject(err);
            }
        }));
        console.log("outside")
    }

    async requestCredPerm() {
        const result = await window.CredentialManager.requestPermission();
        if (result !== "granted") {
            window.location.reload();
        }
    }

    async installCredHandler() {
        await this.requestCredPerm();
        var CredentialHandlers = await navigator.credentialsPolyfill.CredentialHandlers;
        try {
            try {
                var registration =await CredentialHandlers.register('/credential');
            } catch (e) {
                console.log(e);
            }
            await registration.credentialManager.hints.keys();
            this.setState({
                installed: true,
            })
        } catch(e) {
            console.log(e);
        }
        if (!registration) {
            console.log("Credential handler not registered");
        }
        await this.addCredHints(registration);
        return registration;
    }

    async addCredHints(registration) {
        return Promise.all([
            registration.credentialManager.hints.set(
                'test', {
                    name: 'TestingUser',
                    enabledTypes: ['VerifiablePresentation', 'VerifiableCredential', 'PermanentResidentCard']
                }
            ),
        ])
    }

    async handleLogin() {
        console.log("saving vc...")
        const credToStore = this.state.vc;
        const credType = 'PermanentResidentCard';
        // eslint-disable-next-line no-undef
        const webCred = new WebCredential(credType, credToStore);
        try {
            const result = await navigator.credentials.store(webCred);
            if (result != null) {
                this.setState({
                    finished: true,
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    async handleGet() {
        const credentialQuery = JSON.parse('{"web": {"VerifiablePresentation": {}}}');
        const result = await navigator.credentials.get(credentialQuery);
    }

    async sessionTransfer() {
        let sessionID = window.location.pathname.split("/").pop();
        let res;
        try {
            res = await axios.get('https://localhost:8080/userInfo/'+sessionID);
            this.setState({
                vc: {
                    "@context": [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://w3id.org/citizenship/v1"
                    ],
                    "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
                    "type": ["VerifiableCredential", "PermanentResidentCard"],
                    "issuer": "did:example:28394728934792387",
                    "issuanceDate": res.data.issuanceDate,
                    "expirationDate": res.data.expirationDate,
                    "credentialSubject": {
                        "id": "did:example:b34ca6cd37bbf23",
                        "type": "Person",
                        "givenName": res.data.credentialSubject.givenName,
                        "familyName": res.data.credentialSubject.familyName,
                        "gender": res.data.credentialSubject.gender,
                        "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                        "residentSince": res.data.credentialSubject.residentSince,
                        "lprCategory": res.data.credentialSubject.lprCategory,
                        "lprNumber": res.data.credentialSubject.lprNumber,
                        "commuterClassification": res.data.credentialSubject.commuterClassification,
                        "birthCountry": res.data.credentialSubject.birthCountry,
                        "birthDate":res.data.credentialSubject.birthDate,
                    },
                    "proof": {
                        "type": "Ed25519Signature2018",
                        "created": "2020-01-30T03:32:15Z",
                        "jws": "eyJhbGciOiJFZERTQSIsI...wRG2fNmAx60Vi4Ag",
                        "proofPurpose": "assertionMethod",
                        "verificationMethod": "did:example:28394728934792387#keys-7f83he7s8",
                    },
                }
            })
        } catch (e){
            console.log(e);
        }

    }

    componentDidMount() {
        this.activate(process.env.REACT_APP_MEDIATOR_URL);
        this.installCredHandler()
        this.sessionTransfer()
    }

    render() {
        if (this.state.finished === true) {
            return <Redirect push to='/done'/>
        }
        return (
            <Container id="display-cred">
                <Row>
                    <Col className="form-space">
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h1 className="mb-4">Your VC is Ready! Click Save to save it in your wallet!</h1>
                    <JSONPretty json={this.state.vc} mainStyle="padding:1em" space="4" theme={{
                        main: 'line-height:1.3;color:#00008b;background:#ffffff;overflow:auto;',
                        error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                        key: 'color:#f92672;',
                        string: 'color:#2B7942;',
                        value: 'color:#2B7942;',
                        boolean: 'color:#0000B3;',
                    }}/>
                    </Col>
                </Row>
                <Button className="float-right" onClick={this.handleLogin}>Save <FaWallet className="white ml-1 mb-1"/></Button>
            </Container>
        )
    }
}

//                <Button onClick={this.handleGet}>Get</Button>
export default DisplayCred