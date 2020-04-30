import React from 'react'

import "../stylesheets/common.css"
import {Container, Card, Form, Button} from 'react-bootstrap'
import * as polyfill from "credential-handler-polyfill";
import axios from 'axios'
import V1 from "did-veres-one";
import {Redirect} from 'react-router-dom'

class DidRequest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sessionID: this.props.id,
            didAuthPresentation: {},
            redirect: false,
        }
        this.getDidAuthPresentation = this.getDidAuthPresentation.bind(this);
         // load CHAPI
         (async () => {
             await polyfill.loadOnce(
                 `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                 + encodeURIComponent(window.location.origin));
         })();
    }

    async getDidAuthPresentation(){
        // did auth credential query chapi
        const credentialQuery = {
            web: {
                VerifiablePresentation: {
                    query: {
                        type: 'DIDAuth',
                    },
                    challenge: this.state.sessionID,
                    domain: window.location.hostname,
                }
            }
        }
        const result = await navigator.credentials.get(credentialQuery);
        if (result !== null) {
            console.log("issuer receive didauth verifiable presentation => ", result)
            this.setState({didAuthPresentation: result.data})
            const options = {mode: 'test', hostname: "veresone.interop.digitalbazaar.com"};
            const veresDriver = V1.driver(options);
            const did = this.state.didAuthPresentation.holder
            const didDoc = await veresDriver.get({did});
            console.log('Resolved!', JSON.stringify(didDoc, null, 2));
            try{
                const resp = await axios.post("https://localhost:8080/verifyDIDAuthPresentation", {
                    didAuthPresentation: this.state.didAuthPresentation,
                    didDoc: {
                        "@context": didDoc.doc["@context"],
                        "id": didDoc.doc.id,
                        "authentication": didDoc.doc.authentication,
                    }
                })
                console.log("did auth response(issuer) => ", resp)
                if (resp.status === 200) {
                    this.setState({redirect: true})
                }
            } catch (e) {
                console.log(e)
            }
        }
        this.props.onChallenge(this.state.challenge)
    }

    render(){
        if (this.state.redirect) {
            return (<Redirect push to="/vcReady"/>)
        }
        return(
            <div className="dark-background">
                <Container className="pt-4 pb-2">
                    <Card id="did-request" className={`txt-left pt-5 mt-5 px-4 center signup-form shadow ${this.state.expand ? "": "expand-form-info"}`}>
                        <h3 className="form-h3">DID Auth</h3>
                        <hr/>
                        <Form.Text className="montserrat-fonts mt-2">Just before we issue your credential, we'd like to perform didAuth to verify
                            your identification again. By pressing continue, you will be directed to
                            your wallet site to complete DID based authentication.
                        </Form.Text>
                        <Button onClick={this.getDidAuthPresentation} block className="signup-btn" style={{"marginTop": "50px"}}>Continue</Button>
                    </Card>
                </Container>
            </div>
        )
    }
}

export default DidRequest
