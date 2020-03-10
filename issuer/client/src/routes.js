import React, {useState} from 'react'
import {Switch, Route, useHistory, withRouter} from 'react-router-dom'

import Cookies from "js-cookie"
import jwtDecode from 'jwt-decode'

// ---------- Components ----------
import InfoForm from './components/infoForm'
import Welcome from './components/welcome'
import DisplayCred from './components/displayCred'
import VcReady from "./components/vcReady";
import Done from './components/done'
import Failed from './components/failed'
import Signup from './components/signup'
import Login from './components/login'
// ---------------------------------

class Routes extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            sessionID: "",
       }
    }

    handleID = (id) => {
        this.setState({
            sessionID: id
        })
    };

    render() {
        const{sessionID} = this.state;
        return(
            <main>
                <Switch>
                    <Route path="/" exact>
                        <Welcome/>
                    </Route>
                    <Route path="/signup" exact>
                        <Signup/>
                    </Route>
                    <Route path="/login" exact>
                        <Login/>
                    </Route>
                    <Route path="/infoForm">
                        <InfoForm onID={this.handleID.bind(this)}/>
                    </Route>
                    <Route path="/vcReady">
                        <VcReady id={sessionID}/>
                    </Route>
                    <Route path="/credential/">
                        <DisplayCred/>
                    </Route>
                    <Route path="/done" exact>
                        <Done/>
                    </Route>
                    <Route path="/failed" exact>
                        <Failed/>
                    </Route>
                </Switch>
            </main>
        )
    }
}

export default withRouter(Routes)