import React from 'react'

import {Container, Button, Row, Form, Spinner, Table} from 'react-bootstrap'
import {Checkbox} from 'semantic-ui-react'
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
            checked: false,
        }
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.handleRememberMe = this.handleRememberMe.bind(this);
        this.exit = this.exit.bind(this);
        this.clearCookie = this.clearCookie.bind(this);
        this.generateDIDAuthPresentation = this.generateDIDAuthPresentation.bind(this);
        this.loadAriesOnce = this.loadAriesOnce.bind(this);
        this.getWalletDID = this.getWalletDID.bind(this);
        this.check = this.check.bind(this);
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
            window.parent.postMessage({type: 'request'}, window.location.origin);
            console.log("loaded credential store UI")
        })();

        if (Cookies.get("wallet_token") !== undefined) {
            this.setState({loggedIn: true})
            await this.getWalletDID()
        }
    }

    check() {
        this.setState({checked: !this.state.checked})
    }

    async getWalletDID() {
        try{
            const resp = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/getWalletDID?token=' + Cookies.get("wallet_token"))
            this.setState({did: resp.data})
            console.log("getting did resp => ", resp)
        } catch(e) {
            console.log(e)
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

    async handleLoggedIn(loggedIn){
        this.setState({loggedIn: loggedIn});
        await this.getWalletDID()
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

    async generateDIDAuthPresentation() {
        //const aries = await this.loadAriesOnce()
        try{
            this.setState({spinnerOn: true})
            const resp = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + "/generatePresentation?did=" + this.state.did + '&token=' + Cookies.get("wallet_token"))
            console.log("generate did auth resp => ", resp)
            this.setState({spinnerOn: false})
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

    render() {
        const {spinnerOn, checked} = this.state;
        return(
            <Container>
                <Row className="form-space">

                </Row>
                {this.state.loggedIn ? (
                    <div>
                        <Form>
                            <Form.Text className="montserrat-fonts">
                                In order to complete DID Auth, Please select your DID down below. We will create a verifiable
                                presentation for your DID and verify your identity. This may take a few seconds.
                            </Form.Text>
                            <Table className="mt-3" striped bordered>
                                <thead>
                                    <tr>
                                        <th colSpan="3">DID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Trustbloc DID</td>
                                        <td><Checkbox onChange={this.check} radio checked={this.state.checked}/></td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className="mt-5">
                                <Button onClick={this.exit} className="float-right ml-2" variant="outline-danger">Exit</Button>
                                {spinnerOn || !checked ? (
                                    <Button disabled className="float-right" variant="success">{spinnerOn ? (<Spinner as="span" animation="border" size="sm"/>) : null}
                                        Continue</Button>
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
