import React from 'react'
import "../stylesheets/common.css"
import {useHistory} from 'react-router-dom'
import {Container, Button, Row, Col} from "react-bootstrap";

function Welcome() {
    let history = useHistory();

    function login() {
        history.push("/login")
    }

    function signup() {
        history.push("/signup")
    }
    return(
        <div className="full-screen">
            <Container as={Row}>
                <Col xl={{span: 10, offset:3}} ls={{span:10, offset:2}} xs={{span: 10, offset:1}} className="py-5">
                    <div id="verifier-welcome-space">

                    </div>
                    <h1 className="extraBig white arial-font pb-5 mb-5">Get your credential verified right now</h1>
                    <div className="mt-5 pt-3 pb-5">
                        <Button onClick={login} id="verifier-login-btn" className="mr-lg-4" variant="primary">Log in</Button>
                        <Button onClick={signup} id="verifier-signup-btn" className="ml-lg-4" variant="danger">Sign up</Button>
                    </div>
                </Col>
            </Container>
        </div>
    )
}

export default Welcome