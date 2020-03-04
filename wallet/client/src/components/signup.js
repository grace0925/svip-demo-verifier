import React from 'react'

import axios from 'axios'

import {Modal, Button, Col, Form, Tabs, Tab} from 'react-bootstrap'
import "../stylesheets/modal.css"
import "../stylesheets/common.css"
import Permission from '../assets/Permission.png'

import RegisterWallet from "./CHAPI/registerWallet";

class Signup extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal: this.props.showModal,
            username: "",
            password: "",
            confirm: "",
            step: 1,
            errMsg: "",
        };
        this.closeModal = this.closeModal.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.handleFinished = this.handleFinished.bind(this);
    }

    closeModal = () => {
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
            });
            if (res.data !== "") {
                this.setState({
                    errMsg: res.data,
                })
            } else {
                this.setState({
                    step: 2,
                });
            }
        } catch (e) {
            console.log(e)
        }
    }

    nothingReallyHappensHere() {

    }

    async handleFinished(finished) {
        this.setState({
            step: 3,
        })
    };

    render() {
        const {username, password, confirm, step, errMsg} = this.state;
        return(
            <Modal backdrop={true} className="square-modal" show={this.state.showModal} onHide={this.nothingReallyHappensHere}>
                {step === 1 ? (
                    <div>
                        <Modal.Header className="signup-header">Sign Up</Modal.Header>
                        <Modal.Body>
                            <p className="ml-2 montserrat-fonts">Your username and password will be used to log into your wallet. Your account is only for you. Do not create a shared account with your family or friends. </p>
                            <Form onSubmit={this.submitHandler} className="px-2 mt-4">
                                <Form.Group>
                                    <Form.Label>Username</Form.Label>
                                    {errMsg !== "" ? (
                                        <Form.Text className="error-text">Username already exists.</Form.Text>
                                    ) : null}
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
                            <Button onClick={this.closeModal}>Cancel</Button>
                        </Modal.Footer>
                    </div>
                ) : step === 2 ? (
                    <div>
                        <Modal.Header className="signup-header">Register your wallet</Modal.Header>
                        <Modal.Body>
                            <p className="ml-2 montserrat-fonts">We need your permission to manage your personal credentials. Please select allow on the pop up window. </p>
                            <img src={Permission} className="center"/>
                            <RegisterWallet onFinished={this.handleFinished}/>
                        </Modal.Body>
                    </div>
                ) : (
                    <div>
                        <Modal.Header className="signup-header">You're all done</Modal.Header>
                        <Modal.Body>
                            <p className="ml-2 montserrat-fonts">Congratulation! You have registered your device as your digital credential wallet.</p>
                            <Button className="float-right mr-2 mb-2" onClick={this.closeModal}>OK</Button>
                        </Modal.Body>
                    </div>
                )}
            </Modal>
        )
    }
}

export default Signup