import React from 'react'

import {Container, Button, Row, Col} from 'react-bootstrap'
import hand from '../assets/hand.png'

import posed from 'react-pose'

class Welcome extends React.Component{
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return(
            <div className="full-screen">
                <Container as={Row} className="h-100">
                    <img className="d-none d-lg-block wallet-welcome-lg" src={hand} alt="welcome logo"/>
                    <img className="d-xs-block d-lg-none wallet-welcome-sm" src={hand} alt="welcome logo"/>
                    <Col sm={12} lg={{span:9, offset:4}} xl={{span:9, offset:9}} className="mt-5 montserrat-fonts dim-white">
                        <div className="d-none d-lg-block welcome-space-lg"> </div>
                        <div className="d-xs-block d-lg-none welcome-space-sm"> </div>
                        <div className="blue-block p-xl-5 p-3">
                            <div className="p-xl-5">
                                <Row>
                                    <Col>
                                        <h1 className="d-none d-lg-block welcome-headline-lg">Verify your Permanent Residency Card with your mobile device</h1>
                                        <h1 className="d-xs-block d-lg-none welcome-headline-sm">Verify your Permanent Residency Card with your mobile device</h1>
                                    </Col>
                                </Row>
                                <Row className="mt-md-5">
                                    <Col>
                                        <h5>Start using your mobile devices as your digital credential wallet today</h5>
                                    </Col>
                                </Row>
                                <Row className="mt-5">
                                    <Col className="center">
                                        <Button id="welcome-signup-btn" variant="light" className="mr-xs-2 mr-lg-5">Signup</Button>
                                        <Button id="welcome-login-btn" variant="dark" className="ml-xs-2 ml-lg-5">Login</Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Container>
            </div>
        )
    }
}

export default Welcome