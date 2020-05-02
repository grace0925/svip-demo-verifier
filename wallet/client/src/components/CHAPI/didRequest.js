import React from 'react'

import {Container, Button, Row, Form, Spinner} from 'react-bootstrap'
import Cookies from "js-cookie";
import * as Aries from '@hyperledger/aries-framework-go'
import axios from 'axios'
import Login from "../login";

class DidRequest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loggedIn: false,
            rememberMe: "",
            did: "",
            spinnerOn: false,
            domain: "",
            challenge: "",
            privateKey: "",
        }
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.handleRememberMe = this.handleRememberMe.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.exit = this.exit.bind(this);
        this.clearCookie = this.clearCookie.bind(this);
        this.generateDIDAuthPresentation = this.generateDIDAuthPresentation.bind(this);
        this.loadAriesOnce = this.loadAriesOnce.bind(this);
        this.getPrivateKey = this.getPrivateKey.bind(this);
    }

    async componentDidMount() {
        window.addEventListener('message', event => {
            console.log(event)
            this.setState({
                domain: event.data.credentialRequestOptions.web.VerifiablePresentation.domain,
                challenge: event.data.credentialRequestOptions.web.VerifiablePresentation.challenge,
            })
        });

        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();

        if (Cookies.get("wallet_token") !== undefined) {
            this.setState({loggedIn: true})
        }
    }

    async loadAriesOnce() {
        try{
            const aries = await new Aries.Framework({
                assetsPath: "node_modules/@hyperledger/aries-framework-go/dist/assets",
                "agent-default-label": "dem-js-agent",
                "http-resolver-url": ["trustbloc@https://resolver.sandbox.trustbloc.dev/1.0/identifiers", "key@https://resolver.sandbox.trustbloc.dev/1.0/identifiers"],
                "auto-accept": true,
                "outbound-transport": ["ws", "http"],
                "transport-return-route": "all",
                "log-level": "debug"
            })
            console.log("successfully loaded aries")
            return aries
        } catch (e) {
            console.log(e)
        }
    }

    handleLoggedIn(loggedIn){
        this.setState({loggedIn: loggedIn});
    };

    handleRememberMe(rememberMe) {
        this.setState({rememberMe: rememberMe})
    }

    clearCookie() {
        if (this.state.rememberMe === "false"){
            Cookies.remove("wallet_token")
        } else{
            console.log("remember me")
        }
    }

    exit() {
        this.clearCookie();
        window.parent.postMessage({
            type: "response",
            credential: {
                dataType: "VerifiablePresentation",
                data: null,
            }
        }, window.location.origin);
    }

    async getPrivateKey() {
        try {
            const resp = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + "/getPrivateKey", {
                params: {
                    did: this.state.did
                }
            })
            if (resp.status === 200) {
                this.setState({privateKey: resp.data})
            }
        } catch (e) {
            console.log(e)
        }
    }

    async generateDIDAuthPresentation() {
        //const aries = await this.loadAriesOnce()
        try{
            this.setState({spinnerOn: true})
            await this.getPrivateKey()
            const aries = await this.loadAriesOnce()
            const resp = await aries.verifiable.generatePresentation({
                presentation: {
                    "@context": "https://www.w3.org/2018/credentials/v1",
                    "type": "VerifiablePresentation",
                    "holder": this.state.did,
                },
                domain: this.state.domain,
                challenge: this.state.challenge,
                did: this.state.did,
                signatureType: "Ed25519Signature2018",
                privateKey: this.state.privateKey,
                keyType: "Ed25519",
                verificationMethod: this.state.did + "#key-1",
            })
            if (resp.verifiablePresentation.hasOwnProperty('verifiableCredential')) {
                delete resp.verifiablePresentation.verifiableCredential
            }
            this.clearCookie()
            this.setState({spinnerOn: false})
            window.parent.postMessage({
                type: "response",
                credential: {
                    dataType: "VerifiablePresentation",
                    data: resp,
                }
            }, window.location.origin);
        } catch (e) {
            console.log(e)
        }
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {did, spinnerOn} = this.state;
        return(
            <Container>
                <Row className="form-space">

                </Row>
                {this.state.loggedIn ? (
                    <div>
                        <Form>
                            <Form.Text className="montserrat-fonts">
                                In order to complete DID Auth, Please enter your DID down below. We will create a verifiable
                                presentation for your DID and verify your identity. This may take a few seconds.
                            </Form.Text>
                            <Form.Group className="mt-4">
                                <Form.Label>User DID</Form.Label>
                                <Form.Control name="did" onChange={this.formChangeHandler} value={did}/>
                                <Form.Text style={{"color": "darkgrey"}}>("did:example:123456789abcdefghi")</Form.Text>
                            </Form.Group>
                            <div className="mt-5">
                                <Button onClick={this.exit} className="float-right ml-2" variant="outline-danger">Exit</Button>
                                {spinnerOn ? (
                                    <Button disabled className="float-right" variant="success"><Spinner as="span" animation="border" size="sm"/>Continue</Button>
                                ) : (
                                    <Button onClick={this.generateDIDAuthPresentation} className="float-right" variant="success">Continue</Button>
                                )}
                            </div>
                        </Form>
                    </div>
                ) : (
                    <div>
                        <Login showModal={!this.state.loggedIn} onCloseModal={this.handleLoggedIn} onRememberMe={this.handleRememberMe}/>
                        <Row className="ready-space"> </Row>
                        <h5>You have to be logged in to your wallet to continue.</h5>
                    </div>
                )}
            </Container>
        )
    }
}

export default DidRequest
