import React from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'

// ---------- Components ----------
import Wallet from './components/wallet'
import CredentialRequest from "./components/CHAPI/credentialRequest";
import CredentialStore from "./components/CHAPI/credentialStore";
import Welcome from './components/welcome';
// --------------------------------

import Cookies from "js-cookie"

class Routes extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            cookie: Cookies.get("token")
        }
    }
    render() {
        return(
            <main>
                <Switch>
                    {this.state.cookie !== undefined ? (
                        <Route render={() => <Redirect to="/home"/>}/>
                    ) : null}
                    <Route path="/" exact>
                        <Welcome/>
                    </Route>
                    <Route path="/home" exact>
                        <Wallet/>
                    </Route>
                    <Route path="/credentialstore" exact>
                        <CredentialStore/>
                    </Route>
                    <Route path="/credentialrequest" exact>
                        <CredentialRequest/>
                    </Route>
                </Switch>
            </main>
        )
    }
}

export default Routes