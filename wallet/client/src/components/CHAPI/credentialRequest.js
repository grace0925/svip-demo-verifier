import React from 'react'

import axios from 'axios'
import JSONPretty from "react-json-pretty";
import Cookies from 'js-cookie'
import _ from 'lodash'

import {Button, Container, Row, Accordion, AccordionCollapse, AccordionToggle, Card, Spinner} from 'react-bootstrap'
import "../../stylesheets/common.css"

import Login from '../login'

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            firstName: "",
            lastName: "",
            vcs: [],
            vcsCopy: [],
            friendlyNames: [],
            verified: false,
            spinnerOn: false,
            err: false,
        };
        this.retrieveVC = this.retrieveVC.bind(this);
        this.verifyVC = this.verifyVC.bind(this);
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.renderListItems = this.renderListItems.bind(this);
        this.exit = this.exit.bind(this);
        this.sleep = this.sleep.bind(this);
        this.sendVC = this.sendVC.bind(this);
    }

    async retrieveVC() {
        let res;
        try {
            let cookie = Cookies.get("wallet_token");
            res = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/getVc?token=' + cookie);

            let vcsCopy = _.cloneDeep(res.data);
            this.setState({
                vcs: res.data,
                vcsCopy: vcsCopy,
                firstName: res.data[0].credentialSubject.givenName,
                lastName: res.data[0].credentialSubject.familyName,
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
            });

        } catch(e) {
            console.log(e)
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async verifyVC(index) {
        let res;
        try {
            this.setState({
                spinnerOn: true,
            });
            res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/verifyVC', this.state.vcs[index])
        } catch (e) {
            console.log(e)
        }

        if (res !== undefined && res.data) {
            this.sleep(1).then(() => {
                this.setState(({vcsCopy}) => ({
                    vcsCopy: [
                        ...vcsCopy.slice(0,index),
                        {
                            ...vcsCopy[index],
                            verified: true,
                        },
                        ...vcsCopy.slice(index+1)
                    ],
                    spinnerOn: false,
                    err: false,
                }));
            })
        } else {
            this.setState({
                err : true,
                spinnerOn: false,
            })
        }

    }


    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    componentDidMount() {
        window.addEventListener('message', event => {
            console.log(event)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
    }

    async handleLoggedIn(loggedIn){
        this.setState({
            loggedIn: loggedIn
        });
        await this.retrieveVC()
    };

    exit() {
        window.parent.postMessage({
            type: "response",
            credential: {
                dataType: "VerifiableProfile",
                data: null,
            }
         }, window.location.origin);
    };

    sendVC(i) {
        window.parent.postMessage({
            type: "response",
            credential: {
                dataType: "VerifiableProfile",
                data: this.state.vcs[i],
            }
        }, window.location.origin)
    };

    renderListItems(){
        let items = this.state.vcsCopy
        let names = this.state.friendlyNames;
        let listItems = [];

        if (items.length === 0) {
            return (
            <Card>
                <Card.Body>You don't have any VC saved</Card.Body>
            </Card>)
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
                                <Button onClick={() => this.sendVC(i)} variant="success" className="select-btn" block>Select this VC</Button>
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
                <Login showModal={true} onCloseModal={this.handleLoggedIn}/>
                <Row className="form-space">

                </Row>
                {this.state.loggedIn ? (
                    <div>
                        {this.state.firstName !== "" ? (
                            <h3>{this.state.firstName} {this.state.lastName}'s wallet:</h3>
                        ): null}
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