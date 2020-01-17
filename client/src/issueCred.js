import React from 'react'
import './common.css'
import {Container, Row, Col, Button} from "react-bootstrap";

export default function IssueCred() {
    return(
        <Container className="issuer" >
            <Row className="mt-5">
                <Col>
                    <h1>Get a verifiable credential right now!</h1>
                    <p>This will only take a few seconds.</p>
                    <Button className="issueBtn" variant="primary mt-5">Issue</Button>
                    <hr/>
                </Col>
            </Row>

        </Container>
    );
}

