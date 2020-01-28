import React from 'react'
import * as polyfill from "credential-handler-polyfill";
import {WebCredential} from "credential-handler-polyfill/WebCredential";

import JSONPretty from "react-json-pretty";

import {Button, Col, Container, Row} from 'react-bootstrap'
import {Web} from "@material-ui/icons";


if (window.location.pathname === '/credential') {
    (async () => {
        console.log("loading polyfill...")
        await polyfill.loadOnce(
            `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` + encodeURIComponent(window.location.origin)
        );
        console.log("polyfill loaded")
        //activate(process.env.REACT_APP_MEDIATOR_URL);
    })();
}

export async function activate(mediatorOrigin) {
    console.log("activating credential handler ", mediatorOrigin);
    const CredentialHandler = navigator.credentialsPolyfill.CredentialHandler;
    const self = new CredentialHandler(mediatorOrigin);
    self.addEventListener('credentialrequest', handleCredentialEvent);
    self.addEventListener('credentialstore', handleCredentialEvent);

    console.log("credential handler activated");
};

function handleCredentialEvent(event) {
    console.log("handling credential event");
    event.respondWith(new Promise(async (resolve, reject) => {
        if(event.type === 'credentialrequest') {
            let query = event.credentialRequestOptions.web.VerifiableProfile;
            query = Object.assign({}, query);
            delete query['@context'];
            if('id' in query && 'publickey' in query && Object.keys(query).length === 2) {
                return resolve({
                    dataType: 'VerifiableProfile',
                    data: {
                        '@context': 'https://w3id.org/identity/v1',
                        id: event.hintKey,
                        //credentialL ...
                    }
                })
            }

        }

        let windowClient;
        let listener;
        window.addEventListener('message', listener = e => {
            if(!(e.source === windowClient && e.origin === window.location.origin)) {
                return;
            }

            if (e.data.type === 'request') {
                return windowClient.postMessage({
                    type: event.type,
                    credentialRequestOrigin: event.credentialRequestOrigin,
                    credentialRequestOptions: event.credentialRequestOptions,
                    credential: event.credential,
                    hintKey: event.hintKey
                }, window.location.origin)
            }

            window.removeEventListener('message', listener);

            if(e.data.type === 'response') {
                return resolve(e.data.credential);
            }

            reject(e.data);
        });

        try {
            windowClient = await event.openWindow('/' + event.type);
        } catch(err) {
            window.removeEventListener('message', listener);
            reject(err);
        }
    }))
};

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
                    "birthCountry": "Bahamas",
                    "birthDate": "1958-07-17",
                    "mrzInformation": "IAUSA0000007032SRC0000000703<<\n2001012M1105108BRA<<<<<<<<<<<5\nSPECIMEN<<TEST<VOID<<<<<<<<<<<"
                },
                "proof": "",
            }
        };

        this.loadPolyfill = this.loadPolyfill.bind(this);
        this.installCredHandler = this.installCredHandler.bind(this);
        this.addCredHints = this.addCredHints.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.requestCredPerm = this.requestCredPerm.bind(this);

        (async () => {
            console.log("loading polyfill...")
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` + encodeURIComponent(window.location.origin)
            );
            console.log("polyfill loaded")
            //activate(process.env.REACT_APP_MEDIATOR_URL);
        })();

    }

    async loadPolyfill() {
        console.log("loading polyfill...");
        /*try {
            await polyfill.loadOnce();
        } catch (e) {
            console.log(e)
        }*/
        try {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` + encodeURIComponent(window.location.origin)
            )
        } catch (e) {
            console.log(e);
        }
        //await activate(process.env.REACT_APP_MEDIATOR_URL);
        await this.requestCredPerm();
    }

    async requestCredPerm() {
        console.log("request permission");
        const result = await window.CredentialManager.requestPermission();
        if (result !== "granted") {
            window.location.reload();
        }
        console.log(result);
    }

    async installCredHandler() {
        console.log("installing credential handler");
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
        console.log("adding credential hints");
        await this.addCredHints(registration);
        console.log("hints added");
        console.log("installation complete");
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
        const webCred = new WebCredential(credType, credToStore);
        try {
            const result = await navigator.credentials.store(webCred);
            console.log(result)
        } catch (e) {
            console.log(e)
        }
    }

    componentDidMount() {
        this.installCredHandler()
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col className="space">
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h1 className="mb-4">Your VC is Ready! Click Save to save it in your wallet!</h1>
                    </Col>
                    <JSONPretty as={Col} json={this.state.vc} mainStyle="padding:1em" space="4" theme={{
                        main: 'line-height:1.3;color:#00008b;background:#ffffff;overflow:auto;',
                        error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                        key: 'color:#f92672;',
                        string: 'color:#2B7942;',
                        value: 'color:#2B7942;',
                        boolean: 'color:#0000B3;',
                    }}/>
                </Row>
                <Button className="float-right" onClick={this.handleLogin}>Save</Button>
            </Container>
        )
    }
}

export default DisplayCred