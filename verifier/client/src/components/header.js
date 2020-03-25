import React from 'react'
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode'

import "../stylesheets/common.css"
import Flag from '../assets/flag.png'

import {Navbar, Nav, Container, Dropdown} from 'react-bootstrap'

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
        }
    }

    componentDidMount() {
        if (Cookies.get("verifier_token") !== undefined) {
            var decoded = jwtDecode(Cookies.get("verifier_token"))
            this.setState({
                username: decoded.username
            })
        }
    }

    signout() {
        Cookies.remove("verifier_token");
        window.location.pathname = "/"
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
                            SVIP Verifier
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
                            {this.state.username !== "" ? (
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle className="header-login-btn">
                                            <Navbar.Text className="darkblue">Welcome, {this.state.username}</Navbar.Text>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={this.signout}>Sign Out</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            ):  null}
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
        );
    }
}

export default Header