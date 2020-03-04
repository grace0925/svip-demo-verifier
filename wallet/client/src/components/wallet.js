import React from 'react'

import {Container, Row} from 'react-bootstrap'
import "../stylesheets/common.css"

class Wallet extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <div className="full-screen">
                <Container as={Row}>
                    <h1>This is the wallet front page</h1>
                </Container>
            </div>
        )
    }
}

export default Wallet