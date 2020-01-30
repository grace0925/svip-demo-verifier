import React from 'react'
import axios from 'axios'

import {Redirect} from 'react-router-dom'

import '../stylesheets/common.css'
import {Container, Form, Col, Button, Spinner, Row} from "react-bootstrap";

class IssueCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            installed: false,
            firstname: '',
            lastname: '',
            spinnerOn: false,
            redirect: false,
            birthday: new Date().toISOString(),
            accessCode: 'FHIGSJ5%%SSVDJVLSLV2890AKFPGAJDOVID$',
        }
    }

    async issueCredPost(obj) {
        let res = await axios.post('http://localhost:8080/issueCred/info', obj);
        console.log(res.data);
    }

    submitHandler = e => {
        e.preventDefault();
        const credInfo = {
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            birthday: this.state.birthday,
            accessCode: this.state.accessCode,
        };
        //this.issueCredPost(credInfo);
        this.loadBtn();
        this.props.onName(credInfo.firstname + ' ' +  credInfo.lastname);
    };

    loadBtn = () => {
        this.setState({
            spinnerOn: true
        });
        setTimeout(function() {
            this.setState({
                spinnerOn: false,
                redirect: true
            })
        }.bind(this), 2000)
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {firstname, lastname, spinnerOn, birthday, accessCode} = this.state;
        if (this.state.redirect === true) {
            return <Redirect push to='/credential'/>
        }
        return(
            <Container className="py-5 mt-5">
                <Row>
                    <Col className="space"> </Col>
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
                                    name="accessCode"
                                    defaultValue={this.state.accessCode}
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

