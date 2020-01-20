import React from 'react'
import axios from 'axios'
import './common.css'
import {Container, Form, Col, Button} from "react-bootstrap";

class IssueCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            lastname: '',
            cred: '',
        }
    }

    submitHandler = e => {
        e.preventDefault();
        const credInfo = {
            firstname: this.state.firstname,
            lastname: this.state.lastname,
        };
        axios.post('http://localhost:8080/issueCred/info', credInfo)
            .then(response => {
            })
            .catch(error => {
                console.log(error)
            })
    };

    changeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {cred, firstname, lastname} = this.state;
        return(
            <Container>
                <Form onSubmit={this.submitHandler} className="txt-center" >
                    <h1>Get a verifiable credential right now!</h1>
                    <p>This will only take a few seconds.</p>
                    <Form.Row className="mt-3">
                        <Form.Group as={Col}>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="First Name"
                                name="firstname"
                                value={firstname}
                                onChange={this.changeHandler}/>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Last Name"
                                name="lastname"
                                value={lastname}
                                onChange={this.changeHandler}/>
                        </Form.Group>
                    </Form.Row>
                    <Button
                        className="issueBtn"
                        variant="primary mt-5"
                        type="submit">Issue</Button>
                    <hr/>
                </Form>
            </Container>
        );
    }
}

export default IssueCred

