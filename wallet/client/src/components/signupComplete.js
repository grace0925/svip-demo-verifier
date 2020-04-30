import React from 'react'

import {Modal, Button} from 'react-bootstrap'
import "../stylesheets/modal.css"
import "../stylesheets/common.css"

class SignupComplete extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showModal: this.props.showModal,
            did: this.props.did
        }
    }

    nothingReallyHappensHere() {

    }

    closeModal = () => {
        this.props.onCloseModal(false)
        this.setState({
            showModal: false,
        })
    };

    render() {
        return(
            <Modal className="square-modal" show={this.state.showModal} onHide={this.nothingReallyHappensHere}>
                <div>
                    <Modal.Header className="signup-header">You're all done</Modal.Header>
                    <Modal.Body>
                        <p className="ml-2 montserrat-fonts">Congratulation! You have registered your device as your digital credential wallet.</p>
                        <p className="ml-2 mt-2 montserrat-fonts">Note down your wallet did:</p>
                        <p className="montserrat-fonts px-2 did-text">{this.state.did}</p>
                        <Button className="float-right mr-2 mb-2" onClick={this.closeModal}>OK</Button>
                    </Modal.Body>
                </div>
            </Modal>
        )
    }
}

export default SignupComplete
