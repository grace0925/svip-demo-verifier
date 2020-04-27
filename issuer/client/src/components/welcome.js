import React from 'react'

import {Redirect} from 'react-router-dom'

import "../stylesheets/common.css"
import "../stylesheets/welcome.css"
import NewYork from '../assets/newYork.jpg'

import Cookies from 'js-cookie'
import V1 from 'did-veres-one'
import {Ed25519KeyPair} from 'crypto-ld'
import {Container, Row, Col, Jumbotron, Card} from 'react-bootstrap'
import {Button, List, Icon} from 'semantic-ui-react'

class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signup: false,
            form: false,
            showCard1: false,
            showCard2: false,
            showCard3: false,
        }
        this.signup = this.signup.bind(this);
        this.veresOne = this.veresOne.bind(this);
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

    toggleCardDescription(id) {
        if (id === 1) {
            this.setState({showCard1: !this.state.showCard1, showCard2: false, showCard3: false});
        } else if (id === 2) {
            this.setState({showCard2: !this.state.showCard2, showCard1: false, showCard3: false});
        } else if (id === 3) {
            this.setState({showCard3: !this.state.showCard3, showCard1: false, showCard2: false});
        }
    }

    async veresOne() {
        const options = {mode: 'test', hostname: "veresone.interop.digitalbazaar.com"};
        const veresDriver = V1.driver(options);

        const keyOptions = {type: 'Ed25519VerificationKey2018', passphrase: "butterbutterchicken"}
        const authKey = await Ed25519KeyPair.generate(keyOptions)
        console.log("invoked key => ", authKey)

        const didDocument = await veresDriver.generate(
            {didType: 'nym', keyType: 'Ed25519VerificationKey2018', authKey: authKey}); // default

        const registrationResult = await veresDriver.register({didDocument});
        console.log('Registered!', JSON.stringify(registrationResult, null, 2));

        const did = didDocument.id
        const didDoc = await veresDriver.get({did});
        console.log('Resolved!', JSON.stringify(didDoc, null, 2));
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
                        <Row className="justify-content-center mt-4 welcome-btn-group">
                            <Button as="a" href="/login" color="blue" className="welcome-btn">Log in</Button>
                            <Button as="a" href="/signup" color="blue" className="welcome-btn-outline ml-2">Sign up</Button>
                            <Button onClick={this.veresOne} color="blue" className="ml-2">Veres One</Button>
                        </Row>
                    </Container>
                </Jumbotron>
                <div>
                    <Container className="mt-4">
                        <h3 id="welcome-title" className="txt-left montserrat-fonts d-none d-md-block">SELECT THE CARD TO LEARN MORE: </h3>
                        <h3 className="txt-left montserrat-fonts d-block d-md-none">SELECT THE CARD TO LEARN MORE: </h3>
                        <Row className="justify-content-center" id="welcome-cards">
                            <Col md={3} xs={12}>
                                <Card id="card-1" className={`${this.state.showCard1 ? 'selected-1' : null}`} onClick={() => this.toggleCardDescription(1)}>
                                    <Icon id="card-1-icon" className="float-right" name="plus"/>
                                    <h5 id="card-1-title">Digital Credential Wallet</h5>
                                </Card>
                            </Col>
                            <Col md={3} xs={12}>
                                <Card id="card-2" className={`${this.state.showCard2 ? 'selected-2' : null}`} onClick={() => this.toggleCardDescription(2)}>
                                    <Icon id="card-2-icon" className="float-right" name="plus"/>
                                    <h5 id="card-2-title">Data Security</h5>
                                </Card>
                            </Col>
                            <Col md={3} xs={12}>
                                <Card id="card-3" className={`${this.state.showCard3 ? 'selected-3' : null}`} onClick={() => this.toggleCardDescription(3)}>
                                    <Icon id="card-3-icon" className="float-right" name="plus"/>
                                    <h5 id="card-3-title">Proof of Identification</h5>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            {this.state.showCard1 ? (
                                <Col md={12} className="d-none d-md-block">
                                    <Card className="welcome-cards-description" id="card-description-1">
                                        <Container className="p-5 mt-4">
                                            <List as="ul" className="montserrat-fonts txt-left" style={{"fontSize": "16px"}}>
                                                <List.Item as="li">A verifiable credential represents all the same information that its physical counterpart does.</List.Item>
                                                <List.Item as="li">Use your mobile devices/browser as your digital credential wallet.</List.Item>
                                                <List.Item as="li">Store and receive your credential in an efficient and easy manner in under a minute.</List.Item>
                                            </List>
                                        </Container>
                                    </Card>
                                </Col>) : null}
                            {this.state.showCard2 ? (
                                <Col md={12} className="d-none d-md-block">
                                    <Card className="welcome-cards-description" id="card-description-2">
                                        <Container className="p-5 mt-4">
                                            <List as="ul" className="montserrat-fonts txt-left" style={{"fontSize": "16px"}}>
                                                <List.Item as="li">Ed25519 cryptographic suite and encrypted data vault protect your private information from potentials data breaches.</List.Item>
                                                <List.Item as="li">Hyperledger Aries Framework Go enables the usage of decentralized identifiers and verifiable credential exchange so
                                                    that you can build your verifiable identity with ease.</List.Item>
                                            </List>
                                        </Container>
                                    </Card>
                                </Col>) : null}
                            {this.state.showCard3 ? (
                                <Col md={12} className="d-none d-md-block">
                                    <Card className="welcome-cards-description" id="card-description-3">
                                        <Container className="p-5 mt-4">
                                            <List as="ul" className="montserrat-fonts txt-left" style={{"fontSize": "16px"}}>
                                                <List.Item as="li">Digital form of government issued identification provides a way to quickly prove your identity.</List.Item>
                                                <List.Item as="li">No more need to carry 5 different IDs. Let verifiable credentials to show who you are and what you can do.</List.Item>
                                            </List>
                                        </Container>
                                    </Card>
                                </Col>) : null}
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }

}

export default Welcome
