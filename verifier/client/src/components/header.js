import React from 'react'

import "../stylesheets/common.css"
import Flag from '../assets/flag.png'

import {Navbar, Nav, Container, Dropdown} from 'react-bootstrap'

class Header extends React.Component {
    constructor(props) {
        super(props);

    }

    render(){
        return(

            <div>
                <div id="header-top-bar"> </div>
                <div id="header-middle-bar">
                    <Container className="pt-2">
                        <img src={Flag} alt="Mini american flag" width="20px" height="14px" className="mr-2 mb-1"/>
                        Department of Homeland Security
                    </Container>
                    <hr id="header-break-line"/>
                </div>
                <Navbar collapseOnSelect expand="lg" variant="dark" className="lightNav">
                    <Container>
                        <Navbar.Brand id="navbar-brand" fixed="top" href="#home" className="darkblue">
                            USCIS - eVerify
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
        );
    }
}

export default Header