import React from 'react'
import * as polyfill from "credential-handler-polyfill";
import {WebCredential} from "credential-handler-polyfill/WebCredential";

import JSONPretty from "react-json-pretty";

import {Button, Col, Container, Row} from 'react-bootstrap'

class DisplayCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            vc: {
                "@context": {
                    "@version": 1.1,
                    "@protected": true,

                    "PermanentResidentCard": {
                        "@id": "https://w3id.org/citizenship#PermanentResidentCard",
                        "@context": {
                            "@version": 1.1,
                            "@protected": true,

                            "id": "@id",
                            "type": "@type",

                            "ctzn": "https://w3id.org/citizenship#",
                            "schema": "http://schema.org/",
                            "xsd": "http://www.w3.org/2001/XMLSchema#",

                            "Person": "schema:Person",

                            "birthCountry": "schema:birthCountry",
                            "birthDate": {"@id": "schema:birthDate", "@type": "xsd:dateTime"},
                            "familyName": "schema:familyName",
                            "gender": "schema:gender",
                            "givenName": "schema:givenName",
                            "image": {"@id": "schema:image", "@type": "@id"},
                            "lprCategory": "ctzn:lprCategory",
                            "lprNumber": "ctzn:lprNumber",
                            "mrzInformation": "ctzn:mrzInformation",
                            "residentSince": {"@id": "ctzn:residentSince", "@type": "xsd:dateTime"}
                        }
                    }
                }
            }
        };

        this.activate = this.activate.bind(this);
        this.loadPolyfill = this.loadPolyfill.bind(this);
        this.installCredHandler = this.installCredHandler.bind(this);
        this.addCredHints = this.addCredHints.bind(this);
        this.beautifyJSON = this.beautifyJSON.bind(this);

    }

    async activate(mediatorOrigin) {
        console.log("activating credential handler ", mediatorOrigin);
        const CredentialHandler = navigator.credentialsPolyfill.CredentialHandler;
        const self = new CredentialHandler(mediatorOrigin);
        console.log("self => ", self)
        self.addEventListener('credentialrequest', this.handleCredentialEvent);
        self.addEventListener('credentialstore', this.handleCredentialEvent);

        try {
            await self.connect();
        } catch (e) {
            console.log(e);
        }
        console.log("credential handler activated");
    };

    handleCredentialEvent = event => {
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

    async loadPolyfill() {
        console.log("loading polyfill...");
        try {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` + encodeURIComponent(window.location.origin)
            )
        } catch (e) {
            console.log(e);
        }
        await this.activate(process.env.REACT_APP_MEDIATOR_URL);
    }

    async installCredHandler() {
        this.loadPolyfill();
        console.log("installing credential handler");
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
        console.log("request permission");
        const result = await window.CredentialManager.requestPermission();
        console.log(result);
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
                'did:method23:5203-0855-1263', {
                    name: this.state.name + "'s social identity",
                    enabledTypes: ['VerifiableProfile'],
                    match: {
                        VerifiableProfile: {
                            id: 'did:method23:5203-0855-1263'
                        }
                    }
                }
            ),
            registration.credentialManager.hints.set(
                'did:method23:3951-2399-0426', {
                    name: this.state.name + "'s business identity",
                    enabledTypes: ['VerifiableProfile'],
                    match: {
                        VerifiableProfile: {
                            id: 'did:method23:3951-2399-0426'
                        }
                    }
                }
            )
        ])
    }

    async handleLogin() {
        const webCredential = new WebCredential("VerifiablePresentation", {
            "@context": "https://w3id.org/credential"
        })
        const credential = await navigator.credentials.get({
            web: {
                VerifiableProfile: {
                    '@context': 'https://w3id.org/identity/v1',
                    id: '',
                    publicKey: ''
                }
            }
        })
        console.log(credential)
    }

    beautifyJSON = () => {
        let data = this.state.vc;
        let pretty = JSON.stringify(data, undefined, 4);
        this.setState({
            vc: pretty,
        })
        //document.getElementById('vc-textarea').innerHTML = pretty;
    }

    componentDidMount() {
        this.beautifyJSON()
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col className="space"> </Col>
                </Row>
                <Row>
                    <JSONPretty json={this.state.vc} theme={{
                        main: 'line-height:1.3;color:#00008b;background:#ffffff;overflow:auto;',
                        error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                        key: 'color:#f92672;',
                        string: 'color:#2B7942;',
                        value: 'color:#2B7942;',
                        boolean: 'color:#0000B3;',
                    }}/>
                </Row>
                <Button onClick={this.installCredHandler}>Install</Button>
                <Button onClick={this.handleLogin}>Login</Button>
            </Container>
        )
    }
}

export default DisplayCred