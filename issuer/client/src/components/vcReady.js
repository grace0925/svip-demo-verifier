import React from 'react'

// ---------- Modules ----------
import QRCode from 'qrcode.react'
import {Redirect, useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Styles ----------
import {Col, Container, Row, Button} from 'react-bootstrap'
import {FaDesktop} from "react-icons/fa";
// ----------------------------

class VcReady extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            ID: this.props.id,
            link: window.location.origin + "/credential/" + this.props.id,
            redirect: false,
        }
        this.handleRedirect = this.handleRedirect.bind(this)
    }

    handleRedirect() {
        this.setState({
            redirect: true,
        })
    }

    render() {
        if (this.state.redirect === true) {
            let dirLink = '/credential/' + this.state.ID
            return <Redirect push to={dirLink}/>
        }
        return (
            <Container>
                <Row>
                    <Col className="ready-space">
                    </Col>
                </Row>
                <Row>
                    <Col className="txt-center">
                        <h1 className="mb-4 font-weight-bold">Your VC is Ready!</h1>
                        <h3>Save it in your wallet on your mobile phone by scanning the QR Code</h3>
                        <QRCode value={this.state.link} size={190} className="mt-2"/>
                        <p>{this.state.link}</p>
                        <h3 className="mt-5 mb-3">Or click the button and save right now!</h3>
                        <Button onClick={this.handleRedirect} variant="primary" style={{backgroundColor: "#1E90FF"}}>Save Now <FaDesktop
                            className="white ml-1 mb-1"/></Button>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default VcReady