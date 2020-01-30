import React from 'react'
import {Button, Col, Container, Row} from "react-bootstrap";

class CredentialStore extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            vc: null,
        }
    }

    componentDidMount() {
        window.addEventListener('message', event => {
            this.setState({
                vc: event.data.credential.data,
            })
        });
        /*(async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();*/
    }

    store = () => {
        window.parent.postMessage({
            type: 'response',
            credential: {
                dataType: 'PermanentResidentCard',
                data: "Hello world"
            }
        }, window.location.origin)
    }

    render() {
        return(
            <Container>
                <Row>
                    <Col className="space">
                    </Col>
                </Row>
                <Row>Testing Store</Row>
                <Button onClick={this.store}>Store</Button>
            </Container>
        )
    }
}

export default CredentialStore