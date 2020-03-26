import React, {useEffect, useState} from 'react'

import {Container, Row, Col, Button} from 'react-bootstrap'
import "../stylesheets/getVC.css"
import "../stylesheets/common.css"
import {FaWallet, FaUserCheck, FaCouch} from 'react-icons/fa'

function OpenWalletInfo() {
    return(
        <Container>
            <div className="verifier-box p-4 mb-4">
                <h5>WELCOME</h5>
                <div className="mt-4">
                    <p>Complete the following actions to verifier your credential.</p>
                </div>
            </div>
            <Row id="verifier-box-second-row" className="txt-center">
                <Col className="verifier-box mr-1 p-4">
                    <h5>Step 1</h5>
                    <FaWallet className="wallet-icon my-4"/>
                    <p>Retrieve your credential from your digital wallet.</p>
                </Col>
                <Col className="verifier-box ml-1 mr-1 p-4">
                    <h5>Step 2</h5>
                    <FaUserCheck className="wallet-icon my-4"/>
                    <p>Let our API do all the background verification for you.</p>
                </Col>
                <Col className="verifier-box ml-1 p-4">
                    <h5>Step 3</h5>
                    <FaCouch className="wallet-icon my-4"/>
                    <p>Sit back and enjoy.</p>
                </Col>
            </Row>
        </Container>
    )
}

export default OpenWalletInfo