import React from 'react'
import * as polyfill from 'credential-handler-polyfill'
import {Container, Button} from 'react-bootstrap'

class Verify extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            vc: {}
        };
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
                console.log("querying")
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
                var registration =await CredentialHandlers.register('/verify');
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


    async handleGet() {
        const credentialQuery = JSON.parse('{"web": {"VerifiablePresentation": {}}}');
        const result = await navigator.credentials.get(credentialQuery);
        console.log(result)
    }

    componentDidMount() {
        console.log("component did mount");
    }

    render() {
        return (
            <Container>
                <h1>testing update</h1>
                <Button onClick={this.handleGet}>Get</Button>
            </Container>
        )
    }
}

export default Verify