import React from 'react'

// ---------- Modules ----------
import QRCode from 'qrcode.react'
import {Redirect, useHistory} from 'react-router-dom'
import base64url, {Base64Url} from 'base64url'
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
            link: "",
            redirect: false,
            walletDID: this.props.did
        }
        this.handleRedirect = this.handleRedirect.bind(this)
    }

    componentDidMount() {
        console.log("did => ", this.props.did)
        const encodedDid = base64url.encode(this.props.did)
        this.setState({encodedDid: encodedDid})
        console.log("encoded did => ", encodedDid)
        this.setState({link: window.location.origin + "/credential/" + this.state.ID + "/" + encodedDid})
    }

    handleRedirect() {
        this.setState({
            redirect: true,
        })
    }

    render() {
        if (this.state.redirect === true) {
            let dirLink = '/credential/' + this.state.ID + '/' + this.state.encodedDid
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