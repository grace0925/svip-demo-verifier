import React from 'react'

// ---------- Modules ----------
import QRCode from 'qrcode.react'
import {useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Styles ----------
import {Col, Container, Row, Button} from 'react-bootstrap'
import {FaDesktop} from "react-icons/fa";
// ----------------------------

function VcReady(props) {
    let history = useHistory();
    let ID = props.ID;
    const link = window.location.origin + "/credential/" + ID;

    function redirect() {
        history.push("/credential/"+ID)
    }

    return(
        <Container>
            <Row>
                <Col className="ready-space">
                </Col>
            </Row>
            <Row>
                <Col className="txt-center">
                    <h1 className="mb-4 font-weight-bold">Your VC is Ready!</h1>
                    <h3>Save it in your wallet on your mobile phone by scanning the QR Code</h3>
                    <QRCode value={link} size={190} className="mt-2"/>
                    <p>{link}</p>
                    <h3 className="mt-5 mb-3">Or click the button and save right now!</h3>
                    <Button onClick={redirect} variant="primary">Save Now <FaDesktop className="white ml-1 mb-1"/></Button>
                </Col>
            </Row>
        </Container>
    )
}

export default VcReady