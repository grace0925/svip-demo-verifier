import React from 'react'

import "../stylesheets/common.css"
import {Container, Card, Form, Button, Spinner} from 'react-bootstrap'
import * as polyfill from "credential-handler-polyfill";
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'

class DidRequest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sessionID: this.props.id,
            redirect: false,
            error: "",
            didauthPresentation: {},
            did: "",
            verifying: false,
        }
        this.getDidAuthPresentation = this.getDidAuthPresentation.bind(this);
        this.verifyPresentation = this.verifyPresentation.bind(this);
         // load CHAPI
         (async () => {
             await polyfill.loadOnce(
                 `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                 + encodeURIComponent(window.location.origin));
         })();
    }

    async getDidAuthPresentation(){
        // did auth credential query chapi
        if (this.state.sessionID === "") {
            this.setState({sessionID: uuidv4()})
        }
        this.setState({error: ""})
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

        if (result === null) {
            console.log("did auth no response")
            this.setState({error: "Error: did auth no response"})
            return;
        }

        console.log("issuer got verifiable presentation ", result)
        this.setState({did: result.data.holder})
        await this.verifyPresentation(result.data)
    }

    async verifyPresentation(presentation) {
        try{
            this.setState({verifying: true})
            const resp = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/verifyPresentation', {
                "presentation": presentation
            })
            console.log("verify did auth presentation result => ", resp.data)
            if (resp.data) {
                this.props.onChallenge(this.state.sessionID)
                this.props.onDID(this.state.did)
                this.setState({redirect: true, verifying: false})
            } else {
                this.setState({error: "failed did auth, please try again", verifying: false})
                return;
            }
        } catch(e) {
            console.log(e)
        }
    }

    render(){
        if (this.state.redirect) {
            return (<Redirect push to="/vcReady"/>)
        }
        return(
            <div className="dark-background">
                <Container className="pt-4 pb-2">
                    {this.state.verifying ? (
                        <Card id="did-request" className={`txt-left pt-5 mt-5 px-4 center signup-form shadow ${this.state.expand ? "": "expand-form-info"}`}>
                            <h3 className="form-h3">Authenticating</h3>
                            <hr/>
                            <Form.Text className="montserrat-fonts mt-2">This will not take long.</Form.Text>
                            <Spinner id="didauthSpinner" as="span" animation="border" className="center mt-5"/>
                        </Card>
                    ) : (
                        <Card id="did-request" className={`txt-left pt-5 mt-5 px-4 center signup-form shadow ${this.state.expand ? "": "expand-form-info"}`}>
                            <h3 className="form-h3">DID Auth</h3>
                            <hr/>
                            <Form.Text className="montserrat-fonts mt-2">Just before we issue your credential, we'd like to verify your identification. By pressing continue, you will be directed to
                            your wallet site to complete DID based authentication.
                            </Form.Text>
                            <Button onClick={this.getDidAuthPresentation} block className="signup-btn" style={{"marginTop": "50px"}}>Continue</Button>
                            {this.state.error === "" ? null : (
                                <Form.Text className="montserrat-fonts mt-2" style={{color: "red", fontWeight: "bold"}}>{this.state.error}</Form.Text>
                            )}
                        </Card>
                    )}
                </Container>
            </div>
        )
    }
}

export default DidRequest
