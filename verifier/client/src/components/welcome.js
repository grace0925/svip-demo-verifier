import React from 'react'
import "../stylesheets/common.css"
import {useHistory} from 'react-router-dom'
import {Container, Jumbotron, Button} from "react-bootstrap";

function Welcome() {
    let history = useHistory()

    function redirect() {
        history.push("/verify")
    }
    return(
        <div>
            <Jumbotron className="lightJumbo">
                <div className="container mt-5">
                    <h1 className="extraBig">Welcome!</h1>
                    <p className="lead">Verifiable credential provides an easy way to verify residency and citizenship information. </p>
                </div>
            </Jumbotron>
            <Container className="mt-5 txt-center">
                <h3 className="font-weight-bold">Click the button to retrieve your credential from wallet right now</h3>
                <Button onClick={redirect} className="mt-3">Open Wallet</Button>
            </Container>

        </div>
    )
}

export default Welcome