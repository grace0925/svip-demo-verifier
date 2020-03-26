import React from 'react'
import "../stylesheets/common.css"
import {useHistory} from 'react-router-dom'
import {Container, Button, Row, Col} from "react-bootstrap";

function Welcome() {
    let history = useHistory();

    function openWallet() {
        history.push("/openWallet")
    }


    return(
        <div className="full-screen">
            <Container as={Row} className="justify-content-center">
                <Col xl={{span: 12, offset:3}} lg={{span:10, offset:2}} xs={{span: 10, offset:1}} className="py-5">
                    <div id="verifier-welcome-space">

                    </div>
                    <h1 className="extraBig white arial-font pb-5 mb-5">Receive & Verify Your Credentials </h1>
                    <div className="pb-5 mt-5 pt-5">
                        <Button onClick={openWallet} id="verifier-welcome-btn" className="mr-lg-4 center" variant="primary">Get Started</Button>
                    </div>
                </Col>
            </Container>
        </div>
    )
}

export default Welcome