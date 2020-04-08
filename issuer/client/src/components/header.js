import React from 'react'

import Cookies from 'js-cookie'
import {useHistory} from 'react-router-dom'

import '../stylesheets/common.css'
import Flag from "../assets/flag.png"
import USCIS from '../assets/USCIS.png'

import {Navbar, Nav, Container, Button, Dropdown} from 'react-bootstrap'
import HeaderLogin from '../components/headerLogin'


function Header(props) {
    let loggedInUser = props.loggedInUser;
    let history = useHistory();
    function handleLogin(login) {
        console.log("login => ", login)
    }

    function signout(){
        Cookies.remove("issuer_token");
        history.push("/")
        window.location.reload();
    }

    return (
        <div>
            <Container className="small-font mt-2">
                <img src={Flag} alt="Mini american flag" width="20px" height="14px" className="mr-1 mb-1"/>
                    Department of Homeland Security
            </Container>
            <Navbar collapseOnSelect expand="lg" variant="dark" className="darkblue">
                <Container>
                    <Navbar.Brand fixed="top" href="/" className="times-new-roman-font">
                        <img src={USCIS} alt="logo" width="56px" height="56px" className="ml-1 mr-2"/>
                        SVIP Issuer
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        {loggedInUser === "" ? <HeaderLogin onLogin={handleLogin}/> : (
                            <div>
                                <Dropdown>
                                    <Dropdown.Toggle className="times-new-roman-font white header-login-btn">
                                        Welcome, {loggedInUser}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={signout}>Sign Out</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}

export default Header