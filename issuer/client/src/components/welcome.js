import React from 'react'

import {Redirect} from 'react-router-dom'

import "../stylesheets/common.css"
import NewYork from '../assets/newYork.jpg'
import PR from '../assets/PR.jpg'
import SK from '../assets/SK.png'

import {FaAddressCard, FaWallet, FaLock} from "react-icons/fa";
import {Container, Row, Col, Button, Jumbotron} from 'react-bootstrap'

class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signup: false,
        }
        this.signup = this.signup.bind(this);
    }
    signup(){
        this.setState({
            signup: true,
        })
    }
    render() {
        if (this.state.signup) {
            return <Redirect push to="/infoForm"/>
        }

        return (
            <div>
                <Jumbotron style={{backgroundImage: `url(${NewYork})`, backgroundSize: 'Cover'}} className="lightJumbo">
                    <Container className="mt-5">
                        <h1 className="extraBig cursive mb-5">Issuer</h1>
                    </Container>
                </Jumbotron>
                <div id="section-a">
                    <Container className="font-light px-3 mb-3">
                        <Row>
                            <Col xs={12} lg={6} className="mt-5">
                                <div className="home-h1">
                                    <FaAddressCard className="mr-3 mb-1 darkblue-icon lg-icon"/>Easy Permanent Residency Card Verification
                                </div>
                                <div className="ml-5 font-darker">
                                    <p className="mb-4">Our service provides an easy way to receive, store, and verify your PR card.</p>
                                    <ul className="ml-3">
                                        <li>Use your phone/browser as your digital credential wallet.</li>
                                        <li>Store and receive your credential in under a minute.</li>
                                        <li>Skip the redundant verification process and enjoy seamless immigration.</li>
                                    </ul>
                                </div>
                                <Button onClick={this.signup} id="home-btn" className="float-right mt-5">Get Started</Button>
                            </Col>
                            <Col className="d-none d-lg-block" lg={{span:5, offset:1}}>
                                <img height="95%" src={PR} alt="PR"/>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div id="section-b">
                    <Container className="font-light px-3">
                        <Row>
                            <Col className="d-none d-lg-block" xs={12} lg={6}>
                                <img id="sk-logo" width="70%" src={SK} alt="SecureKey"/>
                            </Col>
                            <Col xs={12} lg={6} className="mt-3">
                                <div className="home-h1 mt-2">
                                    <FaLock className="mr-3 mb-1 darkblue-icon lg-icon"/>Blockchain technology ensures data safety
                                </div>
                                <div className="ml-5 font-darker">
                                    <div>
                                        <p className="mb-4">Filler filler filler fillers.....</p>
                                        <ul className="ml-3">
                                            <li>Cool thing 1</li>
                                            <li>Cool thing 2</li>
                                            <li>Cool thing 3</li>
                                        </ul>
                                    </div>
                                    <p>What is happening</p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

            </div>
        )
    }

}

export default Welcome