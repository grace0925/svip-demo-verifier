import React from 'react'

import axios from 'axios'
import {Redirect} from 'react-router-dom'

import '../stylesheets/common.css'
import {Container, Form, Col, Button, Row, Card, Modal} from "react-bootstrap";
import InputMask from "react-input-mask";

class Signup extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            confirm: "",
            err: "",
            expand: false,
        };
        this.detectScreen = this.detectScreen.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
    }

    detectScreen = () => {
        if (window.innerWidth < 768) {
            this.setState({
                expand: true,
            })
        } else {
            this.setState({
                expand: false,
            })
        }
    };

    submitHandler(e) {
        e.preventDefault();
        this.signUp()
    };

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

    componentDidMount() {
        window.addEventListener("resize", this.detectScreen.bind(this));
        this.detectScreen();
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/login"/>
        }
        const {username, password, confirm, expand} = this.state;
        return(
            <div className="dark-background">
                <Container className="py-5">
                    <Card id="signup" className={`py-5 center txt-left signup-form shadow ${expand ? "": "expand-form-signup"}`}>
                        <h3 className="form-h3 ml-4">Sign Up </h3>
                        <Form onSubmit={this.submitHandler} className="px-4 py-3" >
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
                                <Form.Text className="montserrat-fonts">Your username and a single time access code are used to log into your issuer account.</Form.Text>
                            </Form.Row>
                            <hr/>
                            {((password !== confirm) && (confirm !== '')) ||
                            (username === '' || password === '' || confirm === '') ?
                                <Button className="signup-btn" type="submit" onClick={this.submitHandler} disabled>Sign up</Button> :
                                <Button className="signup-btn" type="submit" onClick={this.submitHandler}>Sign up</Button>}
                            <div className="montserrat-fonts mt-3">
                                <Form.Text>Already have an account?</Form.Text>
                                <a href="/login">Login Here</a>
                            </div>
                        </Form>
                        {this.state.err === "" ? null : (
                            <p className="error-text montserrat-fonts ml-4">{this.state.err}</p>
                        )}
                    </Card>
                </Container>
            </div>
        )
    }
}

export default Signup

