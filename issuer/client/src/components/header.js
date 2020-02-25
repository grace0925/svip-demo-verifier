import React from 'react'

import '../stylesheets/common.css'
import Flag from "../assets/flag.png"
import USCIS from '../assets/USCIS.png'

import {Navbar, Nav, Container, Button} from 'react-bootstrap'
import HeaderLogin from '../components/headerLogin'


function Header(props) {
    let loggedInUser = props.loggedInUser;
    function handleLogin(login) {
        console.log("login => ", login)
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
                        {loggedInUser === "" ? <HeaderLogin onLogin={handleLogin}/> :
                            <p className="mt-4 times-new-roman-font white">Welcome, {loggedInUser}</p>}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}

export default Header