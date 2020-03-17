import React from 'react'

import axios from 'axios'
import {Redirect} from 'react-router-dom'

import {Row, Container, Form, Button, Col} from 'react-bootstrap'
import "../stylesheets/common.css"
import "../stylesheets/auth.css"

class Login extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            errMsg: "",
        }
        this.submitHandler = this.submitHandler.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
    }


    submitHandler(e) {
        e.preventDefault()
        this.login()
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

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

    render() {
        const {username, password, errMsg} = this.state;
        if (this.state.redirect) {
            return <Redirect push to="/openWallet"/>
        }
        return (
            <div className="light-grey-background">
                <Container>
                    <Row>
                        <Col className="auth-box p-4" xs={12} md={{span: 6, offset: 3}}>
                            <h3>Log in</h3>
                            <Form onSubmit={this.submitHandler}>
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
                                <hr/>
                                <div className="mt-3 mb-3">
                                    <Form.Text>Don't have an account?</Form.Text>
                                    <a href="/signup">Sign up Here</a>
                                </div>
                                {(username !== "" && password !== "") ? (
                                    <Button className="light-btn" type="submit" block>Login</Button>
                                ) : (
                                    <Button className="light-btn" type="submit" block disabled>Login</Button>
                                )}
                                {errMsg !== "" ? (
                                        <Form.Text className="error-text">{errMsg}</Form.Text>
                                    ) :
                                    null}
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Login