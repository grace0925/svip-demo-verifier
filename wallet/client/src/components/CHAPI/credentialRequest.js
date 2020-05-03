import React from 'react'

import axios from 'axios'
import JSONPretty from "react-json-pretty";
import Cookies from 'js-cookie'
import _ from 'lodash'

import {Button, Container, Row, Accordion, AccordionCollapse, AccordionToggle, Card, Spinner} from 'react-bootstrap'
import "../../stylesheets/common.css"

import Login from '../login'
import jwtDecode from "jwt-decode";

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            loadedVCs: false,
            username: "",
            vcs: [],
            vcsCopy: [],
            friendlyNames: [],
            verified: false,
            spinnerOn: false,
            rememberMe: "",
            err: false,
        };
        this.handleRememberMe = this.handleRememberMe.bind(this);
        this.retrieveVC = this.retrieveVC.bind(this);
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.renderListItems = this.renderListItems.bind(this);
        this.exit = this.exit.bind(this);
        this.sleep = this.sleep.bind(this);
        this.sendVC = this.sendVC.bind(this);
        this.clearCookie = this.clearCookie.bind(this);
    }

    async retrieveVC() {
        let res;
        try {
            let cookie = Cookies.get("wallet_token");
            this.setState({loadedVCs: false})
            res = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/getVc?token=' + cookie);
            console.log("retrieve VC => ", res.data)
            let vcsCopy = _.cloneDeep(res.data);
            this.setState({
                vcs: res.data,
                vcsCopy: vcsCopy,
            });

            let friendlyNames = res.data.map(vc =>
                vc.friendlyName
            );
            let rawVcs = this.state.vcs;
            rawVcs.forEach(rawVc => {
                delete rawVc.friendlyName;
                delete rawVc._rev;
                delete rawVc.verified;
            });

            this.setState({
                vcs: rawVcs,
                friendlyNames: friendlyNames,
                loadedVCs: true,
            });

        } catch(e) {
            console.log(e)
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    async componentDidMount() {
        let decoded = jwtDecode(Cookies.get("wallet_token"))
        this.setState({username: decoded.username})
        window.addEventListener('message', event => {
            console.log(event)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
        if (Cookies.get("wallet_token") !== undefined) {
            this.setState({loggedIn: true})
        }
        await this.retrieveVC()
    }

    handleRememberMe(rememberMe) {
        this.setState({rememberMe: rememberMe})
    }

    async handleLoggedIn(loggedIn){
        this.setState({loggedIn: loggedIn});
        await this.retrieveVC();
    };

    exit() {
        this.clearCookie()
        window.parent.postMessage({
            type: "response",
            credential: {
                dataType: "VerifiablePresentation",
                data: null,
            }
        }, window.location.origin);
    };

    clearCookie() {
        if (this.state.rememberMe === "false"){
            Cookies.remove("wallet_token")
        } else{
            console.log("remember me")
        }
    }

    sendVC(i) {
        this.clearCookie()
        window.parent.postMessage({
            type: "response",
            credential: {
                dataType: "VerifiablePresentation",
                data: this.state.vcs[i],
            }
        }, window.location.origin)
    };

    renderListItems(){
        let items = this.state.vcsCopy
        let names = this.state.friendlyNames;
        let listItems = [];

        if (items.length === 0 && this.state.loadedVCs) {
            return (
                <Card>
                    <Card.Body>You don't have any VC saved</Card.Body>
                </Card>)
        }

        if (!this.state.loadedVCs) {
            return <Spinner className="center" animation="border" variant="primary"/>
        }

        for (let i = 0; i < items.length; i++) {
            items[i].index = i;
        }
        for (let i = 0; i < items.length; i++) {
            listItems.push(
                <Card>
                    <AccordionToggle as={Card.Header} eventKey={items[i].index}>
                        {names[i]}
                    </AccordionToggle>
                    <AccordionCollapse eventKey={items[i].index}>
                        <div>
                            <Card.Body>
                                <JSONPretty json={this.state.vcs[i]} mainStyle="padding:1em" space="4" theme={{
                                    main: 'line-height:1.0;color:#00008b;background:#ffffff;overflow:auto;',
                                    error: 'line-height:1.0;color:#66d9ef;background:#272822;overflow:auto;',
                                    key: 'color:#f92672;',
                                    string: 'color:#2B7942;',
                                    value: 'color:#2B7942;',
                                    boolean: 'color:#0000B3;',
                                }}/>
                            </Card.Body>
                            <div className="px-2 mb-1">
                                <Button onClick={() => this.sendVC(i)} variant="outline-primary" block>Select this VC</Button>
                            </div>
                        </div>
                    </AccordionCollapse>
                </Card>
            )
        }
        return listItems
    }

    render() {
        return (
            <Container>
                <Row className="form-space">

                </Row>
                {this.state.loggedIn ? (
                    <div>
                        {this.state.username !== "" ? (
                            <h3>{this.state.username}'s wallet:</h3>
                        ): (<Spinner className="center" animation="border" variant="primary"/>)}
                        <Accordion>
                            {this.renderListItems()}
                        </Accordion>
                        {this.state.err ? (
                            <p className="error-text">Failed to verify credential.</p>
                        ) : null}
                        <Button className="float-right mt-2 mr-2 mb-2 verifier-btn" onClick={this.exit}>Exit</Button>
                    </div>
                ) : (
                    <div>
                        <Login showModal={!this.state.loggedIn} onCloseModal={this.handleLoggedIn} onRememberMe={this.handleRememberMe}/>
                        <Row className="ready-space"> </Row>
                        <h5>You have to be logged in to your wallet to continue.</h5>
                    </div>
                )}
                <Row className="footer-space">

                </Row>

            </Container>
        )
    }
}

export default CredentialRequest