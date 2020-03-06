import React from 'react'

import {Container, Row, Col} from 'react-bootstrap'

function Failed() {
    return(
        <Container>
            <Row>
                <Col className="ready-space">
                </Col>
            </Row>
            <Row >
                <h1 className="txt-center">Oops, failed to save credential...</h1>
            </Row>
            <Row>
                <a href="/">Back to Home</a>
            </Row>
        </Container>
    )
}

export default Failed