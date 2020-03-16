import React from 'react'
import {Nav} from 'react-bootstrap'

function HeaderLogin(props) {
    return (
        <Nav>
            <Nav.Link className="nav-login" href="/login">Log in</Nav.Link>
            <Nav.Link className="nav-signup" href="/signup">Sign up</Nav.Link>
        </Nav>
    );
}

export default HeaderLogin