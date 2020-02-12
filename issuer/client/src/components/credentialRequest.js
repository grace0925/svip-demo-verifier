import React from 'react'

import axios from 'axios'
import {Button, ListGroup, Container} from 'react-bootstrap'

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            friendlyName: '',
            displayVC: false,
            vc: {
                credentialSubject: {
                    givenName: '',
                    familyName: '',
                }
            },
        };
        this.confirm = this.confirm.bind(this);
        this.print = this.print.bind(this);
    }

    async confirm() {
        let res;
        try {
            res = await axios.get("https://localhost:8081/getVC");
            this.setState({
                friendlyName: res.data.friendlyName,
                displayVC: true,
            });
            this.setState(prevState => {
                let vc = Object.assign({}, prevState.vc);
                vc = res.data;
                return {vc}
            });
        } catch(e) {
            console.log(e)
        }
        /*window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: res.data,
                }
            },
            window.location.origin
        );*/
    }

    print() {
        console.log(this.state.vc)
    }

    renderBtn() {
        if (!this.state.displayVC) {
            return (
                <Button className="mt-5" onClick={this.confirm}>Test{this.state.friendlyName}</Button>
            )
        } else {
            return null
        }
    }

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
            await this.confirm()
        })();
    }
    render() {
        return (
            <Container>
                <Button className="mt-5" onClick={this.print}>Print</Button>
                <h3>{this.state.vc.credentialSubject.givenName} {this.state.vc.credentialSubject.familyName}'s wallet:</h3>
                <ListGroup>
                    <ListGroup.Item action onClick={this.print}>{this.state.friendlyName}</ListGroup.Item>
                </ListGroup>
            </Container>
        )
    }
}

export default CredentialRequest