import React from 'react'

import axios from 'axios'

import {Modal, Button, Form, Spinner} from 'react-bootstrap'
import "../stylesheets/modal.css"
import "../stylesheets/common.css"
import Permission from '../assets/Permission.png'

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
            spinnerOn: false,
            did: "",
        };
        this.closeModal = this.closeModal.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.registerHandler = this.registerHandler.bind(this);
    }

    closeModal = () => {
        this.props.onCloseModal(false)
        this.props.onDID(this.state.did)
        this.setState({
            showModal: false,
        })
    };

    formChangeHandler = e => {
        if (e.target.name === "username") {
            let regex = /^[^\.]*$/;
            if (!regex.test(e.target.value)) {
                this.setState({
                    errMsg: "Username can't contain special character '.'"
                })
            } else {
                this.setState({
                    errMsg: "",
                })
            }
        }
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    // signup form submit handler calls createAccount endpoint to create new wallet account; this should also generate/store
    // wallet-specific DID and corresponding private key.
    async submitHandler() {
        let res;
        try {
            this.setState({spinnerOn: true})
            res = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/createAccount', {
                params: {
                    username: this.state.username.toLowerCase(),
                    password: this.state.password,
                }
            });
            if (res.data.includes("Account exists")) {
                this.setState({
                    spinnerOn: false,
                    errMsg: "Account exists",
                })
            } else {
                this.setState({
                    did: res.data,
                    spinnerOn: false,
                    step: 2,
                });
            }
        } catch (e) {
            console.log(e)
        }
    }

    nothingReallyHappensHere() {
        // boostrap screams at me without onHide function for modal, someone fix it pls if you know how...
    }

    registerHandler = () => {
        this.props.onRegister(true)
        this.closeModal()
    }

    render() {
        const {username, password, confirm, step, errMsg} = this.state;
        return(
            <Modal backdrop={true} className="square-modal" show={this.state.showModal} onHide={this.nothingReallyHappensHere}>
                {step === 1 ? (
                    <div>
                        <Modal.Header className="signup-header">Sign Up</Modal.Header>
                        <Modal.Body>
                            <p className="ml-2 montserrat-fonts">Your username and password will be used to log into your wallet.
                                We are also generating did and crypto keys to make sure your data is safe. This may take awhile. </p>
                            <Form onSubmit={this.submitHandler} className="px-2 mt-4">
                                <div className={`${(this.state.errMsg !== "") ? 'error-state' : ''}`}>
                                    <Form.Group>
                                        <Form.Label>Username</Form.Label>
                                        {errMsg !== "" ? (
                                            <Form.Text className="error-text">{errMsg}</Form.Text>
                                        ) : null}
                                        <Form.Control type="username" name="username" value={username} onChange={this.formChangeHandler}/>
                                    </Form.Group>
                                </div>
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
                            (this.state.username === '' || this.state.password === '' || this.state.confirm === '' || this.state.errMsg !== '') ?
                                <Button onClick={this.submitHandler} disabled>Sign up</Button> : this.state.spinnerOn ?
                                    <Button disabled onClick={this.submitHandler}><Spinner as="span" animation="border" size="sm"/>Sign up</Button> :
                                    <Button onClick={this.submitHandler}>Sign up</Button>}
                            <Button onClick={this.closeModal}>Cancel</Button>
                        </Modal.Footer>
                    </div>
                ) : (
                    <div>
                        <Modal.Header className="signup-header">Register your wallet</Modal.Header>
                        <Modal.Body>
                            <p className="ml-2 montserrat-fonts">We need your permission to manage your personal credentials. Please select allow on the pop up window. </p>
                            <img src={Permission} className="center"/>
                            <Button onClick={this.registerHandler} className="mt-4" block>Register Wallet</Button>
                        </Modal.Body>
                    </div>
                )}
            </Modal>
        )
    }
}

export default Signup
