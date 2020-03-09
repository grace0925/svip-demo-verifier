import React from 'react'

import axios from 'axios'
import JSONPretty from "react-json-pretty";
import Cookies from 'js-cookie'
import {Button, Container, ListGroup, Row, Accordion, AccordionCollapse, AccordionToggle, Card} from 'react-bootstrap'

import Login from '../login'

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            firstName: "",
            lastName: "",
            vcs: [],
            rawvc: {
                credentialSubject: {
                    givenName: '',
                    familyName: '',
                }
            },
        };
        this.retrieveVC = this.retrieveVC.bind(this);
        this.verifyVC = this.verifyVC.bind(this);
        this.handleLoggedIn = this.handleLoggedIn.bind(this);
        this.renderListItems = this.renderListItems.bind(this);
    }

    async retrieveVC() {
        let res;
        try {
            let cookie = Cookies.get("wallet_token");
            res = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/getVc?token=' + cookie);
            console.log(JSON.stringify(res, undefined, 2))
            this.setState({
                vcs: res.data,
                firstName: res.data[0].credentialSubject.givenName,
                lastName: res.data[0].credentialSubject.familyName,
            });
            console.log("state => ", this.state)
            this.setState(prevState => {
                let rawvc = Object.assign({}, prevState.rawvc);
                rawvc = res.data;
                delete rawvc.friendlyName;
                delete rawvc._rev;
                return {rawvc}
            });
        } catch(e) {
            console.log(e)
        }
    }

    async verifyVC() {
        window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: this.state.vc,
                }
            },
            window.location.origin
        );
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

    handleLoggedIn = (loggedIn) => {
        this.setState({
            loggedIn: loggedIn
        });
        this.retrieveVC()

    };

    renderListItems(){
        let items = this.state.vcs;
        let listItems = [];
        if (items.length === 0) {
            return (<Card>
                <Card.Body>You don't have any VC saved</Card.Body>
            </Card>)
        }
        for (let i = 0; i < items.length; i++) {
            items[i].index = i;
        }
        for (let i = 0; i < items.length; i++) {
            listItems.push(
                <Card>
                    <Card.Header>
                        <AccordionToggle as={Button} variant="light" eventKey={items[i].index}>
                            {items[i].friendlyName}
                        </AccordionToggle>
                        <AccordionCollapse eventKey={items[i].index}>
                            <Card.Body>
                                <JSONPretty json={items[i]} mainStyle="padding:1em" space="4" theme={{
                                    main: 'line-height:1.0;color:#00008b;background:#ffffff;overflow:auto;',
                                    error: 'line-height:1.0;color:#66d9ef;background:#272822;overflow:auto;',
                                    key: 'color:#f92672;',
                                    string: 'color:#2B7942;',
                                    value: 'color:#2B7942;',
                                    boolean: 'color:#0000B3;',
                                }}/>
                            </Card.Body>
                        </AccordionCollapse>
                    </Card.Header>
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
                        <h3>{this.state.firstName} {this.state.lastName}'s wallet:</h3>
                        <Accordion>
                            {this.renderListItems()}
                        </Accordion>
                    </div>
                ) : (
                    <div>
                        <Row className="ready-space"> </Row>
                        <h5>You have to be logged in to your wallet to continue.</h5>
                    </div>
                )}

            </Container>
        )
    }
}

export default CredentialRequest