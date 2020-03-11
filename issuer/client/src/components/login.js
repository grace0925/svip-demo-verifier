import React from 'react'

import {Card, Container, Form, Button, Col} from 'react-bootstrap'
import "../stylesheets/common.css"

import axios from 'axios'
import {Redirect} from 'react-router-dom'

class Login extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            oneTimeAccessCode: "FSK84039&FIDSJVYOEKVHYEO223528501#",
            expand: false,
            redirect: false,
            errMsg: "",
        };
        this.detectScreen = this.detectScreen.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
    }

    submitHandler(e) {
        e.preventDefault();
        this.login()
    }

    async login() {
        let res
        try{
            res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/login', {
                username: this.state.username.toLowerCase(),
                password: this.state.password,
            });
        } catch(e) {
            console.log(e)
        }
        if (res.data !== "") {
            this.setState({
                errMsg: res.data
            })
        } else {
            this.setState({
                errMsg: "",
                redirect: true,
            });
            window.location.reload()
        }
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
            return <Redirect push to="/infoForm"/>
        }
        const {username, password, oneTimeAccessCode, expand, errMsg} = this.state;
        return(
            <div className="dark-background">
                <Container className="py-5">
                    <Card id="login" className={`py-5 center txt-left signup-form shadow ${expand ? "": "expand-form-signup"}`}>
                        <h3 className="form-h3 ml-4">Login</h3>
                        <Form onSubmit={this.submitHandler} className="px-4 py-3">
                            <Form.Row>
                                <Form.Group as={Col}>
                                    <Form.Label className="txt-left">Username</Form.Label>
                                    <Form.Control name="username" onChange={this.formChangeHandler} value={username}/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col}>
                                    <Form.Label className="txt-left">Password</Form.Label>
                                    <Form.Control type="password" name="password" onChange={this.formChangeHandler} value={password}/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col}>
                                    <Form.Label className="txt-left">One Time Access Code</Form.Label>
                                    <Form.Control name="oneTimeAccessCode" value={oneTimeAccessCode} onChange={this.formChangeHandler}/>
                                </Form.Group>
                            </Form.Row>
                            <hr/>
                            {(username !== "" && password !== "" && oneTimeAccessCode !== "") ? (
                                <Button className="signup-btn" type="submit" onClick={this.submitHandler}>Login</Button>
                            ) : (
                                <Button className="signup-btn" type="submit" onClick={this.submitHandler} disabled>Login</Button>
                            )}
                            {errMsg !== "" ? (
                                    <Form.Text className="error-text">{errMsg}</Form.Text>
                                ) :
                                null}
                        </Form>
                    </Card>
                </Container>
            </div>
        )
    }
}

export default Login
