import React from 'react'
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode'
import {Redirect} from 'react-router-dom'
import '../stylesheets/common.css'
import {Navbar, Nav, Dropdown} from 'react-bootstrap'

class Header extends React.Component {
    constructor(props) {
        super(props);
        console.log(Cookies.get("wallet_token"))
        this.state = {
            username: "",
        }
        this.signout = this.signout.bind(this);
    }
    componentDidMount() {
        if (Cookies.get("wallet_token") !== undefined) {
            var decoded = jwtDecode(Cookies.get("wallet_token"))
            this.setState({
                username: decoded.username
            })
        }
    }

    signout() {
        Cookies.remove("wallet_token");
        window.location.pathname = "/"
    }

    render() {
        return (
            <div>
                <Navbar fixed="top" variant="dark" className="darkblue">
                    <Navbar.Brand href="#home">SVIP Wallet</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        {this.state.username !== "" ? (
                            <div>
                                <Dropdown>
                                    <Dropdown.Toggle className="header-login-btn">
                                        <Navbar.Text className="white">Welcome, {this.state.username}</Navbar.Text>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={this.signout}>Sign Out</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        ):  null}
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}

export default Header