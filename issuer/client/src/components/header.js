import React from 'react'
import '../stylesheets/common.css'
import Flag from "../assets/flag.png"
import USCIS from '../assets/USCIS.png'
import {Navbar, Nav, Container} from 'react-bootstrap'

function Header() {
    return (
        <div>
            <Container className="small-font mt-2">
                <img src={Flag} alt="Mini american flag" width="20px" height="14px" className="mr-1 mb-1"/>
                    Department of Homeland Security
            </Container>
            <Navbar variant="dark" className="darkblue">
                <Container>
                    <Navbar.Brand fixed="top" href="#home" className="times-new-roman-font">
                        <img src={USCIS} alt="logo" width="58px" height="58px" className="ml-1 mr-2"/>
                        SVIP Issuer
                    </Navbar.Brand>
                    <Nav className="mr-auto"> </Nav>
                </Container>
            </Navbar>
        </div>
    );
}

export default Header