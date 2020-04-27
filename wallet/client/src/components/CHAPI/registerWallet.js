import React from 'react'

import {Container} from 'react-bootstrap'
import * as polyfill from 'credential-handler-polyfill'

class RegisterWallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            installed: false,
        };
        (async () => {
            console.log("loading polyfill")
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
            console.log("loaded")
        })();
        this.installCredHandler = this.installCredHandler.bind(this);
        this.addCredHints = this.addCredHints.bind(this);
        this.requestCredPerm = this.requestCredPerm.bind(this);
        this.uninstallCredHandler = this.uninstallCredHandler.bind(this);
        this.get = this.get.bind(this);
    }
    componentDidMount() {
        this.activate(process.env.REACT_APP_MEDIATOR_URL);
        this.installCredHandler();

    }

    async activate(origin) {
        console.log("activating handler")
        const CredentialHandler = navigator.credentialsPolyfill.CredentialHandler;
        const self = new CredentialHandler(origin)

        self.addEventListener('credentialrequest', this.handleCredentialEvent);
        self.addEventListener('credentialstore', this.handleCredentialEvent);
        console.log("activated")

        await self.connect();
    }

    async installCredHandler() {
        await this.requestCredPerm();
        var CredentialHandlers = await navigator.credentialsPolyfill.CredentialHandlers;
        try {
            try {
                var registration =await CredentialHandlers.register('/register');
                console.log("registration => ", registration)
            } catch (e) {
                console.log(e);
            }
            await registration.credentialManager.hints.keys();
        } catch(e) {
            console.log(e);
        }
        if (!registration) {
            console.log("Credential handler not registered");
        }
        await this.addCredHints(registration);
        console.log("registration => ", registration)
        this.setState({
            installed: true,
        });
        this.props.onFinished(true);
        return registration;
    }

    async uninstallCredHandler() {
        const CredentialHandlers = navigator.credentialsPolyfill.CredentialHandlers;
        await this.requestCredPerm();
        await CredentialHandlers.unregister("/")
        await navigator.credentialsPolyfill.permissions.revoke(
            {name: 'credentialhandler'}
        )
        this.setState({
            installed: false,
        })
        alert("Unregistered")
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
    handleCredentialEvent(event) {
        event.respondWith(new Promise(async (resolve, reject) => {
            console.log("inside event hanlder", event.type)
            console.log("inside event handler, event => ", event)
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
                    if (e.data.credential.data != null) {
                        console.log("-----got data")
                        return resolve(e.data.credential)
                    } else {
                        console.log("-----got null")
                        return resolve(null)
                    }
                }
                // assume e.data is an error
                reject(e.data);
            });

            try {
                console.log('opening app window...');
                console.log(event.type)
                console.log('https://' + `${process.env.REACT_APP_VERIFIER_HOST}`)
                console.log('https://' + `${process.env.REACT_APP_ISSUER_HOST}`)
                if (event.type === "credentialrequest" && event.credentialRequestOrigin === 'https://' + `${process.env.REACT_APP_VERIFIER_HOST}`){
                    windowClient = await event.openWindow('/credentialrequest');
                } else if (event.type === "credentialstore"){
                    windowClient = await event.openWindow('/credentialstore');
                } else if (event.type==="credentialrequest" && event.credentialRequestOrigin === 'https://' + `${process.env.REACT_APP_ISSUER_HOST}`) {
                    windowClient = await event.openWindow('/didrequest')
                }
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

    async get() {
        const credToStore = '';
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

    render() {
        return (
            <Container>
            </Container>
        )
    }

}

export default RegisterWallet