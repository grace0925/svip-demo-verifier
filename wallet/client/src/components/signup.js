import React from 'react'

import axios from 'axios'

import {Modal, Button, Col, Form} from 'react-bootstrap'
import "../stylesheets/modal.css"
import "../stylesheets/common.css"

class Signup extends React.Component{
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            showModal: this.props.showModal,
            username: "",
            password: "",
        }
        this.signup = this.signup.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    async signup() {
        let res;
        try {
            res = await axios.post('https://localhost:8082/createAccount', {
                username: this.state.username,
                password: this.state.password,
            })
        } catch (e) {
            console.log(e)
        }
    }

    cancel = () => {
        this.props.onCloseModal(false)
        this.setState({
            showModal: false,
        })
    };

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {username, password} = this.state;
        return(
            <Modal className="square-modal" show={this.state.showModal} onHide={this.cancel}>
                <Modal.Header className="signup-header">Sign Up</Modal.Header>
                <Modal.Body>
                    <p className="ml-2 montserrat-fonts">Your username and password will be used to log into your wallet. Your account is only for you. Do not create a shared account with your family or friends. </p>
                    <Form className="px-2 mt-4">
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="username" name="username" value={username} onChange={this.formChangeHandler}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" value={password} onChange={this.formChangeHandler}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.signup}>Sign up</Button>
                    <Button onClick={this.cancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default Signup