import React from 'react'

import {Container, Row, Col} from 'react-bootstrap'

function Done() {
    return(
        <Container>
            <Row>
                <Col className="ready-space">
                </Col>
            </Row>
            <Row >
                <h1 className="txt-center">Credential Saved</h1>
            </Row>
            <Row>
                <a href="/">Back to Home</a>
                <a href="https://localhost:8081">Verifier</a>
                <a href="https://localhost:8082">Wallet</a>
            </Row>
        </Container>
    )
}

export default Done