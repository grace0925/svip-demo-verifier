import React from 'react'

import axios from 'axios'
import {Redirect} from 'react-router-dom'

import "../stylesheets/common.css"
import NewYork from '../assets/newYork.jpg'
import PR from '../assets/PR.jpg'
import SK from '../assets/SK.png'

import Cookies from 'js-cookie'

import * as polyfill from 'credential-handler-polyfill'

import {FaAddressCard, FaWallet, FaLock} from "react-icons/fa";
import {Container, Row, Col, Button, Jumbotron} from 'react-bootstrap'

class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signup: false,
            form: false,
        }
        this.signup = this.signup.bind(this);
    }
    signup(){
        if (Cookies.get("issuer_token") !== undefined) {
            this.setState({
                form: true,
            })
        } else {
            this.setState({
                signup: true,
            })
        }
    }

    render() {
        if (this.state.signup) {
            return <Redirect push to="/signup"/>
        }
        if (this.state.form) {
            return <Redirect push to="/infoForm"/>
        }

        return (
            <div>
                <Jumbotron style={{backgroundImage: `url(${NewYork})`, backgroundSize: 'Cover'}} className="lightJumbo">
                    <Container className="mt-5">
                        <h1 className="extraBig cursive mb-5">Issuer</h1>
                    </Container>
                </Jumbotron>
                <div>
                    <Row id="verifier-welcome" className="container-fluid px-xs-3 my-xs-2 font-light px-lg-5 py-lg-3 my-lg-5 align-left">
                        <Col xs={12} lg={{span:5, offset:1}} className="mt-5 section-a">
                            <div className="home-h1">
                                <FaAddressCard className="mr-3 mb-1 darkblue-icon lg-icon"/>Easy Permanent Residency Card Verification
                            </div>
                            <div className="font-darker">
                                <p className="mb-4">Our service provides an easy way to receive, store, and verify your PR card.</p>
                                <ul className="ml-3">
                                    <li>Use your phone/browser as your digital credential wallet.</li>
                                    <li>Store and receive your credential in under a minute.</li>
                                    <li>Skip the redundant verification process and enjoy seamless immigration.</li>
                                </ul>
                                <Button onClick={this.signup} id="home-btn" className="float-right mr-5">Get Started</Button>
                            </div>
                        </Col>
                        <Col id="section-b" xs={12} lg={5} className="mt-4 ml-lg-4">
                            <div className="home-h1 mt-2">
                                <FaLock className="mr-3 mb-1 darkblue-icon lg-icon"/>Blockchain technology ensures data safety
                            </div>
                            <div className="font-darker">
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
                </div>
            </div>
        )
    }

}

export default Welcome