import React from 'react'

import {Container, Button, Row, Form, Spinner} from 'react-bootstrap'
import Cookies from "js-cookie";
import axios from 'axios'
import V1 from 'did-veres-one'
import {Ed25519KeyPair} from 'crypto-ld'
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
        }
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.handleRememberMe = this.handleRememberMe.bind(this);
        this.resolveDID = this.resolveDID.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.exit = this.exit.bind(this);
        this.clearCookie = this.clearCookie.bind(this);
        this.generateDIDAuthPresentation = this.generateDIDAuthPresentation.bind(this);
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

    handleLoggedIn(loggedIn){
        this.setState({loggedIn: loggedIn});
    };

    handleRememberMe(rememberMe) {
        this.setState({rememberMe: rememberMe})
    }

    async resolveDID() {
        try{
            this.setState({spinnerOn: true})
            const did = this.state.did;
            const options = {mode: 'test', hostname: "veresone.interop.digitalbazaar.com"};
            const veresDriver = V1.driver(options);
            const didDoc = await veresDriver.get({did});
            console.log('Resolved!', JSON.stringify(didDoc, null, 2));
            const res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/didAuth' ,{
                "@context": didDoc.doc["@context"],
                "id": didDoc.doc.id,
                "authentication": didDoc.doc.authentication,
            })
            this.setState({spinnerOn: false})
        } catch (e) {
            console.log(e)
        }
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

    async generateDIDAuthPresentation() {
        console.log("generating did auth presentation for did ", this.state.did)
        try{
            const resp = await axios.get("https://localhost:8082/generateDIDAuthPresentation", {
                params: {
                    did: this.state.did,
                    domain: this.state.domain,
                    challenge: this.state.challenge,
                }
            })
            console.log("wallet generate did auth presentation resp => ", JSON.stringify(resp, null, 2))
            this.clearCookie()
            window.parent.postMessage({
                type: "response",
                credential: {
                    dataType: "VerifiablePresentation",
                    data: resp.data,
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
