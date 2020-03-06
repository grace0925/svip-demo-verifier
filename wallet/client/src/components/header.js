import React from 'react'
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode'
import '../stylesheets/common.css'
import {Navbar, Nav} from 'react-bootstrap'

class Header extends React.Component {
    constructor(props) {
        super(props);
        console.log(Cookies.get("wallet_token"))
        this.state = {
            username: "",
        }
    }
    componentDidMount() {
        if (Cookies.get("wallet_token") !== undefined) {
            var decoded = jwtDecode(Cookies.get("wallet_token"))
            this.setState({
                username: decoded.username
            })
        }
    }

    render() {
        return (
            <div>
                <Navbar fixed="top" variant="dark" className="darkblue">
                    <Navbar.Brand href="#home">SVIP Wallet</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        {this.state.username !== "" ? (
                            <Navbar.Text className="white">Welcome, {this.state.username}</Navbar.Text>
                        ): null }
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}

export default Header