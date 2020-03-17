import React from 'react'

import axios from 'axios'
import {Redirect} from 'react-router-dom'

import {Container, Form, Col, Button, Row, Card, Modal} from "react-bootstrap";
import "../stylesheets/getVC.css"
import "../stylesheets/auth.css"
import "../stylesheets/common.css"


class Signup extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            confirm: "",
            err: "",
        };
        this.submitHandler = this.submitHandler.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.signUp = this.signUp.bind(this);
    }

    submitHandler(e) {
        e.preventDefault();
        this.signUp()
    }

    async signUp() {
        try {
            const res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/createAccount', {
                username: this.state.username.toLowerCase(),
                password: this.state.password,
            });
            if (res.data === "Account exists") {
                this.setState({
                    err : "Username already exists"
                })
            } else {
                this.setState({
                    redirect: true,
                    err : "",
                })
            }
        } catch (e) {
            console.log(e)
            this.setState({
                err: "Something went wrong..."
            })
        }
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {username, password, confirm} = this.state;
        if (this.state.redirect) {
            return <Redirect push to="/login"/>
        }
        return (
            <div className="light-grey-background">
                <Container>
                    <Row>
                        <Col className="auth-box p-4" xs={12} md={{span: 6, offset: 3}}>
                            <h3>Sign up</h3>
                            <Form onSubmit={this.submitHandler}>
                                <Form.Row>
                                    <Form.Group as={Col}>
                                        <Form.Label className="txt-left">Username</Form.Label>
                                        <Form.Control name="username" onChange={this.formChangeHandler} value={username}/>
                                    </Form.Group>
                                </Form.Row>
                                <div className={`${(password !== confirm) && (confirm !== '') ? 'error-state' : ''}`}>
                                    <Form.Row>
                                        <Form.Group as={Col}>
                                            <Form.Label className="txt-left">Password</Form.Label>
                                            <Form.Control type="password" name="password" onChange={this.formChangeHandler} value={password}/>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col}>
                                            <Form.Label className="txt-left">Confirm Password</Form.Label>
                                            {(password !== confirm) && (confirm !== '') ?
                                                (<Form.Text className="error-text">The passwords don't match.</Form.Text>) : null}
                                            <Form.Control type="password" name="confirm" onChange={this.formChangeHandler} value={confirm}/>
                                        </Form.Group>
                                    </Form.Row>
                                </div>
                                <Form.Row className="mt-2">
                                    <Form.Text>Your username and a single time access code are used to log into your issuer account.</Form.Text>
                                </Form.Row>
                                <hr/>
                                <div className="mt-3 mb-3">
                                    <Form.Text>Already have an account?</Form.Text>
                                    <a href="/login">Login Here</a>
                                </div>
                                {((password !== confirm) && (confirm !== '')) ||
                                (username === '' || password === '' || confirm === '') ?
                                    <Button className="light-btn" type="submit" onClick={this.submitHandler} block disabled>Sign up</Button> :
                                    <Button className="light-btn" type="submit" onClick={this.submitHandler} block>Sign up</Button>}
                            </Form>
                            {this.state.err === "" ? null : (
                                <p className="error-text montserrat-fonts">{this.state.err}</p>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Signup