import React from 'react'
import {Modal, Form, Button} from 'react-bootstrap'

import axios from 'axios'

import '../stylesheets/modal.css'
import '../stylesheets/common.css'

class Login extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal: this.props.showModal,
            username: "",
            password: "",
            errMsg: "",
        };
        this.closeModal = this.closeModal.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.login = this.login.bind(this);
        this.cancel = this.cancel.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
    }

    cancel = () => {
        this.props.onCloseModal(false);
        this.setState({
            showModal: false,
        })
    };

    closeModal = () => {
        this.props.onCloseModal(true);
        this.setState({
            showModal: false,
        })
    };

    async submitHandler(e) {
        e.preventDefault();
        await this.login()
    };

    async login() {
        let res;
        try {
            res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/login', {
                username: this.state.username.toLowerCase(),
                password: this.state.password,
            })
        } catch (e) {
            console.log(e);
        }
        if (res.data !== "") {
            this.setState({
                errMsg: res.data
            })
        } else {
            this.setState({
                errMsg: "",
            });
            this.closeModal()
        }
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    render() {
        const {username, password, errMsg} = this.state;
        return(
            <Modal className="square-modal" show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header className="signup-header">Login</Modal.Header>
                <Modal.Body>
                    <p className="ml-2 montserrat-fonts">Log in with your username and password.</p>
                    <Form onSubmit={this.submitHandler} className="px-2 mt-4">
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="username" name="username" value={username} onChange={this.formChangeHandler}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" value={password} onChange={this.formChangeHandler}/>
                        </Form.Group>
                        {errMsg !== "" ? (
                            <Form.Text className="error-text">{errMsg}</Form.Text>
                        ) :
                            null}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {(username !== '' && password !== '') ? (
                        <Button onClick={this.submitHandler}>Login</Button>
                    ) : (
                        <Button onClick={this.submitHandler} disabled>Login</Button>
                    )}
                    <Button onClick={this.cancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default Login