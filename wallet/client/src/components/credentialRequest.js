import React from 'react'

import axios from 'axios'
import JSONPretty from "react-json-pretty";
import {Button, Accordion, Container, Card, ListGroup, Row, FormControl} from 'react-bootstrap'

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            friendlyName: '',
            displayWallet: false,
            displayVC: false,
            id: '',
            rawvc: {
                credentialSubject: {
                    givenName: '',
                    familyName: '',
                }
            },
        };
        this.retreiveVC = this.retreiveVC.bind(this);
        this.print = this.print.bind(this);
        this.verifyVC = this.verifyVC.bind(this);
    }

    async retreiveVC() {
        this.setState({
            displayWallet: true,
        })
        let res;
        try {
            res = await axios.get("https://localhost:8081/displayVc?ID=" + this.state.id);
            console.log(JSON.stringify(res, undefined, 2))
            this.setState({
                friendlyName: res.data.friendlyName,
            });
            this.setState(prevState => {
                let rawvc = Object.assign({}, prevState.rawvc);
                rawvc = res.data;
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

    print() {
        console.log(this.state.vc)
        this.setState({
            displayVC: !this.state.displayVC
        })
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    componentDidMount() {
        window.addEventListener('message', event => {
            /*this.setState({
                vc: event.data.credential.data,
            })*/
            console.log(event)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
    }
    render() {
        return (
            <Container>
                <Row className="form-space">

                </Row>
                {this.state.displayWallet ? (<div>
                    <h3>{this.state.rawvc.credentialSubject.givenName} {this.state.rawvc.credentialSubject.familyName}'s wallet:</h3>
                    <ListGroup>
                        <ListGroup.Item action onClick={this.print}>{this.state.friendlyName}</ListGroup.Item>
                    </ListGroup>
                    {this.state.displayVC ? (
                        <div>
                            <Card>
                                <Card.Body>
                                    <JSONPretty json={this.state.vc} mainStyle="padding:1em" space="4" theme={{
                                        main: 'line-height:1.0;color:#00008b;background:#ffffff;overflow:auto;',
                                        error: 'line-height:1.0;color:#66d9ef;background:#272822;overflow:auto;',
                                        key: 'color:#f92672;',
                                        string: 'color:#2B7942;',
                                        value: 'color:#2B7942;',
                                        boolean: 'color:#0000B3;',
                                    }}/>
                                </Card.Body>
                            </Card>
                            <Button onClick={this.verifyVC} className="float-right mt-3 mb-2">Verify VC</Button>
                        </div>
                    ) : null}
                </div>) : (<div>
                    <FormControl onChange={this.formChangeHandler} name="id" placeholder="vc id" value={this.state.id}/>
                    <Button className="float-right mt-2" onClick={this.retreiveVC}>Get</Button>
                </div>)}

            </Container>
        )
    }
}

export default CredentialRequest