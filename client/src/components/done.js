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
        </Container>
    )
}

export default Done