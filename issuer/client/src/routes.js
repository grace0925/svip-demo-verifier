import React, {useState} from 'react'
import {Switch, Route, useHistory} from 'react-router-dom'

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
        super(props)
        this.state = {
            sessionID: "",
            registered: false,
            name: "",
            loggedIn: false,
        }
    }

    handleID = (id) => {
        this.setState({
            sessionID: id
        })
    };

    handleRegistered = (registered) => {
        this.setState({
            registered: registered
        })
    };

    handleName = (fullname) => {
        this.setState({
            name: fullname,
        })
        this.props.onName(fullname)
    };

    render() {
        const{sessionID, registered, name} = this.state;
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
                        <InfoForm onID={this.handleID.bind(this)} onName={this.handleName}/>
                    </Route>
                    <Route path="/vcReady">
                        <VcReady id={sessionID} onRegistered={this.handleRegistered}/>
                    </Route>
                    <Route path="/credential/">
                        <DisplayCred registered={registered}/>
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

export default Routes