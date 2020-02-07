import React from 'react'

import axios from 'axios'

import {Button, Col, Container, Row, FormControl} from "react-bootstrap";

class CredentialStore extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            vc: {},
            friendlyName: '',
        }
        this.store = this.store.bind(this)
        this.cancel = this.cancel.bind(this)
    }

    componentDidMount() {
        window.addEventListener('message', event => {
            this.setState({
                vc: event.data.credential.data,
            })
            console.log(this.state.vc)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
    }

    async store() {
        let vc = this.state.vc;
        vc.friendlyName = this.state.friendlyName;
        try {
            let res = await axios.post('/storeVC', vc)
        } catch (e) {
            console.log(e)
        }
        window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: vc,
                }
            },
            window.location.origin
        );
    }

    cancel() {
        window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: null,
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

    render() {
        return(
            <Container>
                <Row>
                    <Col className="ready-space">
                    </Col>
                </Row>
                <Row>
                    <h5>Give this VC a friendly name so it's easier for you to remember next time:</h5>
                    <FormControl placeholder="Friendly Name" className="mb-3" value={this.state.friendlyName} name="friendlyName" onChange={this.formChangeHandler}/>
                    <h5>Are you sure you want to store this VC in your wallet?</h5>
                </Row>
                <Row className="mt-5 float-right">
                    <Button variant="success mr-3" onClick={this.store}>Confirm</Button>
                    <Button variant="danger" onClick={this.cancel}>Cancel</Button>
                </Row>
            </Container>
        )
    }
}

export default CredentialStore