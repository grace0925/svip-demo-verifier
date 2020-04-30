import React from 'react'

import "../stylesheets/common.css"
import {Container, Card, Form, Button} from 'react-bootstrap'
import * as polyfill from "credential-handler-polyfill";
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'
import JSONPretty from "react-json-pretty";


class DidRequest extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sessionID: this.props.id,
            didAuthPresentation: {},
            showPres: false,
            redirect: false,
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

    async verifyPresentation() {
        try {
            const resp  = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + "/verifyDIDAuthPresentation", {
                "didAuthPresentation": this.state.didAuthPresentation
            })
            console.log("did auth resp => ", resp)
            if (resp.status === 200) {
                this.setState({redirect: true})
            }
            this.props.onChallenge(this.state.challenge)
        } catch(e) {
            console.log(e)
        }
    }

    async getDidAuthPresentation(){
        // did auth credential query chapi
        if (this.state.sessionID === "") {
            this.state.sessionID = uuidv4()
        }
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
            console.log("did auth presentation => ", result)
            this.setState({didAuthPresentation: result.data, showPres: true})
        }
    }

    render(){
        if (this.state.redirect) {
            return (<Redirect push to="/vcReady"/>)
        }
        return(
            <div className="dark-background">
                <Container className="pt-4 pb-2">
                    {this.state.showPres ? (
                        <Card id="did-request" className={`txt-left pt-5 mt-5 px-4 center signup-form shadow ${this.state.expand ? "": "expand-form-info"}`}>
                            <h3 className="form-h3">DID Auth Presentation</h3>
                            <hr/>
                            <Form.Text className="montserrat-fonts mt-2">We have received a DID auth presentation from your wallet. Press continue to verify your presentation
                                to complete DID auth.
                            </Form.Text>
                            <JSONPretty json={this.state.didAuthPresentation} mainStyle="padding:1em" space="4" theme={{
                                main: 'line-height:1.3;color:#00008b;background:#ffffff;overflow:auto;',
                                error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                                key: 'color:#f92672;',
                                string: 'color:#2B7942;',
                                value: 'color:#2B7942;',
                                boolean: 'color:#0000B3;',
                            }}/>
                            <Button onClick={this.verifyPresentation} block className="signup-btn" style={{"marginTop": "50px"}}>Continue</Button>
                        </Card>
                    ) : (
                        <Card id="did-request" className={`txt-left pt-5 mt-5 px-4 center signup-form shadow ${this.state.expand ? "": "expand-form-info"}`}>
                            <h3 className="form-h3">DID Auth</h3>
                            <hr/>
                            <Form.Text className="montserrat-fonts mt-2">Just before we issue your credential, we'd like to perform didAuth to verify
                                your identification again. By pressing continue, you will be directed to
                                your wallet site to complete DID based authentication.
                            </Form.Text>
                            <Button onClick={this.getDidAuthPresentation} block className="signup-btn" style={{"marginTop": "50px"}}>Continue</Button>
                        </Card>
                    )}
                </Container>
            </div>
        )
    }
}

export default DidRequest
