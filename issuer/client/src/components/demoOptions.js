import React from 'react'

import "../stylesheets/common.css"
import PrCard from "../assets/PRCard.jpg"

import {Container, Row, Col, Button, Jumbotron} from 'react-bootstrap'

class DemoOptions extends React.Component {
    handleChoice = (choice) => {
        console.log("choice is ", choice)
        this.props.onChoice(choice)
    }
    render() {

        return (
            <div>
                <Jumbotron className="lightJumbo">
                    <div className="container mt-5">
                        <h1 className="extraBig">Welcome!</h1>
                        <p className="lead">Verifiable credential provides an easy way to verify residency and citizenship information. </p>
                    </div>
                </Jumbotron>
                <Container>
                    <h3 className="font-weight-bold">Get started right now by choosing one of these models</h3>
                    <Row className="mt-5">
                        <Col className="option-txt display-center" xs={{span: 6, offset: 3}}>
                            <Button onClick={() => this.handleChoice(1)} variant="outline-light card-border" size="sm">
                                <div className="black">
                                    <img className="circle-img mt-3" src={PrCard} alt="PM"/>
                                    <h5 className="mt-3">Permanent Resident Card</h5>
                                    <p>PRs are required to present their valid PR card when boarding a flight to, or travelling to Canada on any other commercial carrier.
                                        A verifiable credential establishes your permanent residency and enables speedy and seamless travel.</p>
                                </div>
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }

}

export default DemoOptions