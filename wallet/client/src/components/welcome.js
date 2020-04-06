import React from 'react'

import {Container, Button, Row, Col, Modal} from 'react-bootstrap'
import hand from '../assets/hand.png'
import {Redirect} from 'react-router-dom'
import Cookies from "js-cookie"

import Signup from '../components/signup'
import Login from '../components/login'
import RegisterWallet from "./CHAPI/registerWallet";
import SignupComplete from "./signupComplete";

class Welcome extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showSignUp: false,
            showLogIn: false,
            showFinishSignup: false,
            register: false,
            redirect: false,
        }
    }

    showLoginModal = () => {
        this.setState({
            showLogIn: true,
        })
    };

    showSignupModal = () => {
        this.setState({
            showSignUp: true,
        })
    };

    handleCloseSignupModal = (closeModal) => {
        this.setState({
            showSignUp: closeModal,
        })
    };

    handleCloseLoginModal = (loggedIn) => {
        if (loggedIn) {
            this.setState({
                showLogIn: false,
            })
            window.location.reload()
        } else {
            this.setState({
                showLogIn: false,
            })
        }
    };

    handleFinishedRegistration = (finished) => {
        if (finished) {
            this.setState({
                showFinishSignup: true,
            })
        }
    };

    handleRegister = (register) => {
        this.setState({
            register: true,
        })
    };

    handleCloseFinishModal = (close) => {
        if (close) {
            this.setState({
                showFinishSignup: false,
            })
        }
    };

    handleRememberMe = (rememberMe) => {
      if (rememberMe === "false"){
          Cookies.remove("wallet_token")
      }
    };

    componentDidMount() {
        if (Cookies.get("wallet_token") !== undefined) {
            this.setState({
                redirect: true,
            })
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/home"/>
        }
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
                                        <Button onClick={this.showSignupModal} id="welcome-signup-btn" variant="light" className="mr-xs-2 mr-lg-5">Signup</Button>
                                        <Button onClick={this.showLoginModal} id="welcome-login-btn" variant="dark" className="ml-xs-2 ml-lg-5">Login</Button>
                                        {this.state.showSignUp ? (<Signup showModal={this.state.showSignUp} onCloseModal={this.handleCloseSignupModal} onRegister={this.handleRegister}/>) : null}
                                        {this.state.showLogIn ? (<Login showModal={this.state.showLogIn} onCloseModal={this.handleCloseLoginModal} onRememberMe={this.handleRememberMe}/>) : null}
                                        {this.state.showFinishSignup ? (<SignupComplete showModal={this.state.showFinishSignup} onCloseModal={this.handleCloseFinishModal}/>) : null}
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Container>
                {this.state.register ? (<RegisterWallet onFinished={this.handleFinishedRegistration}/>) : null}
            </div>
        )
    }
}

export default Welcome