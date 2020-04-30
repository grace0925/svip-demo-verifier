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
            username: "",
        };
        console.log("constructing app => ", window.location.pathname)
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log(window.location.pathname)
    }

    componentDidMount() {
        (() => {
            if (Cookies.get("issuer_token") !== undefined) {
                var decoded = jwtDecode(Cookies.get("issuer_token"));
                console.log("decoded username => ", decoded.username);
                this.setState({
                    username: decoded.username
                })
            }
        })();
    }

    render() {
        const {username} = this.state;
        return (
            <div className="App">
                <Header loggedInUser={username}/>
                <Routes/>
            </div>
        )
    }
}

export default App;
