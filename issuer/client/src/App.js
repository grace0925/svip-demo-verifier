import React, {Component} from 'react';
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

// ---------- Components ----------
import Header from './components/header';
import Routes from './routes';
// --------------------------------

import './stylesheets/App.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        console.log("constructing app => ", window.location.pathname)
    }

    render() {
        return (
            <div className="App">
                <Header/>
                <Routes/>
            </div>
        )
    }
}

export default App;
