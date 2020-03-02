import React from 'react'

import axios from 'axios'

import {Modal, Button, Col, Form} from 'react-bootstrap'
import "../stylesheets/modal.css"
import "../stylesheets/common.css"

class Signup extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal: this.props.showModal,
            username: "",
            password: "",
            confirm: "",
        };
        this.cancel = this.cancel.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
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

    async submitHandler() {
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

    render() {
        const {username, password, confirm} = this.state;
        return(
            <Modal className="square-modal" show={this.state.showModal} onHide={this.cancel}>
                <Modal.Header className="signup-header">Sign Up</Modal.Header>
                <Modal.Body>
                    <p className="ml-2 montserrat-fonts">Your username and password will be used to log into your wallet. Your account is only for you. Do not create a shared account with your family or friends. </p>
                    <Form onSubmit={this.submitHandler} className="px-2 mt-4">
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="username" name="username" value={username} onChange={this.formChangeHandler}/>
                        </Form.Group>
                        <div className={`${(this.state.password !== this.state.confirm) && (this.state.confirm !== '') ? 'error-state' : ''}`}>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" value={password} onChange={this.formChangeHandler}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Confirm Password</Form.Label>
                                {(this.state.password !== this.state.confirm) && (this.state.confirm !== '') ?
                                    (<Form.Text className="error-text">The passwords don't match.</Form.Text>) : null}
                                <Form.Control type="password" name="confirm" value={confirm} onChange={this.formChangeHandler}/>
                            </Form.Group>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {((this.state.password !== this.state.confirm) && (this.state.confirm !== '')) ||
                    (this.state.username === '' || this.state.password === '' || this.state.confirm === '') ?
                        <Button onClick={this.submitHandler} disabled>Sign up</Button> :
                        <Button onClick={this.submitHandler}>Sign up</Button>}
                    <Button onClick={this.cancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default Signup