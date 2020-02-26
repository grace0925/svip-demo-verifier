import React from 'react'
import "../stylesheets/common.css"
import {useHistory} from 'react-router-dom'
import {Container, Jumbotron, Button} from "react-bootstrap";

function Welcome() {
    let history = useHistory();

    function redirect() {
        history.push("/verify")
    }
    return(
        <div>
            <Jumbotron className="lightJumbo">
                <div className="container mt-5 mb-5">
                    <h1 className="extraBig white arial-font">Get your credential verified right now</h1>
                    <div className="mt-5 pt-3 pb-5">
                        <Button onClick={redirect} id="verifier-login-btn" className="mr-lg-4" variant="primary">Log in</Button>
                        <Button onClick={redirect} id="verifier-signup-btn" className="ml-lg-4" variant="danger">Sign up</Button>
                    </div>
                </div>
            </Jumbotron>
        </div>
    )
}

export default Welcome