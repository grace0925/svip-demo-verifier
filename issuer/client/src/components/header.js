import React from 'react'

import '../stylesheets/common.css'
import Flag from "../assets/flag.png"
import USCIS from '../assets/USCIS.png'

import {Navbar, Nav, Container, Button} from 'react-bootstrap'


function Header() {
    function signup() {
        console.log("signing up")
    }
    return (
        <div>
            <Container className="small-font mt-2">
                <img src={Flag} alt="Mini american flag" width="20px" height="14px" className="mr-1 mb-1"/>
                    Department of Homeland Security
            </Container>
            <Navbar collapseOnSelect expand="lg" variant="dark" className="darkblue">
                <Container>
                    <Navbar.Brand fixed="top" href="#home" className="times-new-roman-font">
                        <img src={USCIS} alt="logo" width="56px" height="56px" className="ml-1 mr-2"/>
                        SVIP Issuer
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Link className="nav-login">Log in</Nav.Link>
                            <Nav.Link className="nav-signup" href="/infoForm">Sign up</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}

export default Header