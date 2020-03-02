import React from 'react'
import {Modal, Form} from 'react-bootstrap'

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
        }
    }

    cancel = () => {
        this.props.onCloseModal(false);
        this.setState({
            showModal: false,
        })
    };

    render() {
        const {username, password} = this.state;
        return(
            <Modal className="square-modal" show={this.state.showModal} onHide={this.cancel}>
                <Modal.Header className="signup-header">Login</Modal.Header>
                <Modal.Body>

                </Modal.Body>
            </Modal>
        )
    }
}

export default Login