import React from 'react'
import "../stylesheets/common.css"
import {Navbar, Nav} from 'react-bootstrap'

function Header() {
    return(
      <div>
          <Navbar fixed="top" variant="dark" className="darkblue">
              <Navbar.Brand href="#home">SVIP Verifier</Navbar.Brand>
              <Nav className="mr-auto"> </Nav>
          </Navbar>
      </div>
    );
}

export default Header