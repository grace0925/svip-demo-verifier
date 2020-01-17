import React from 'react'
import './common.css'
import {Navbar, Nav, Jumbotron} from 'react-bootstrap'

export default function Header() {
    return (
        <div>
            <Navbar variant="dark" className="darkblue">
                <Navbar.Brand href="#home">SVIP Verifier</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#cred">Issue Credential</Nav.Link>
                </Nav>
            </Navbar>
            <Jumbotron className="lightJumbo">
                <div className="container mt-5">
                    <h1 className="extraBig">Welcome!</h1>
                    <p className="lead">
                        With a verifiable credential, you can do so many awesome thing!
                    </p>
                    <p>
                        Insert random explanation...
                    </p>
                </div>
            </Jumbotron>
        </div>
    );
}