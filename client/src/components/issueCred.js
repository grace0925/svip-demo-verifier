import React from 'react'
import axios from 'axios'
import '../stylesheets/common.css'
import {Container, Form, Col, Button, Spinner, Row} from "react-bootstrap";

class IssueCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            lastname: '',
            spinnerOn: false,
            birthday: new Date().toISOString(),
            accessCode: '',
            cred: '',
        }
        console.log(this.props.egChoice)

    }

    submitHandler = e => {
        e.preventDefault();
        const credInfo = {
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            birthday: this.state.birthday,
            accessCode: this.state.accessCode,
        };
        console.log(credInfo)
        this.setState({
            spinnerOn: true
        });
        axios.post('http://localhost:8080/issueCred/info', credInfo)
            .then(response => {

            })
            .catch(error => {
                console.log(error)
            })
        setTimeout(function() {
            this.setState({
                spinnerOn: false
            })
        }.bind(this), 1000)
    };

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {cred, firstname, lastname, spinnerOn, birthday, accessCode} = this.state;
        return(
            <Container className="py-5 mt-5">
                <Row>
                    <Col className="space"></Col>
                </Row>
                <hr/>

                <Form onSubmit={this.submitHandler} className="txt-center py-3" >
                    {this.props.egChoice === 1 ? (<h1>Get a verifiable credential for seamless immigration!</h1>)
                        : (<h1>Get a verifiable credential for speedy air travel!</h1>)}
                    <p>This will only take a few seconds.</p>
                        <Form.Group className="pt-5 pb-2" as={Row}>
                            <Form.Label column xs={2} className="txt-left">First Name</Form.Label>
                            <Col xs={10}>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    name="firstname"
                                    value={firstname}
                                    onChange={this.formChangeHandler}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column xs={2} className="txt-left">Last Name</Form.Label>
                            <Col xs={10}>
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    name="lastname"
                                    value={lastname}
                                    onChange={this.formChangeHandler}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column xs={2} className="txt-left">Birthday</Form.Label>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="birthday"
                                    value={birthday}
                                    onChange={this.formChangeHandler}
                                />
                            </Col>
                            <Form.Label column xs={2} className="txt-left">Access Code</Form.Label>
                            <Col xs={5}>
                                <Form.Control
                                    type="text"
                                    name="accessCode"
                                    defaultValue="FHIGSJ5%%SSVDJVLSLV2890AKFPGAJDOVID$"
                                />
                            </Col>
                        </Form.Group>
                    {spinnerOn ? (<Button className="issueBtn" variant="primary mt-5" disabled>
                                    <Spinner animation="grow" size="sm" className="mr-3"/>
                                    Loading</Button>)
                        : <Button className="issueBtn"
                                variant="primary mt-5"
                                type="submit">
                                Issue
                    </Button>}
                </Form>
                <hr/>
            </Container>
        );
    }
}

export default IssueCred

