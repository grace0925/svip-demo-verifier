import React from 'react'
import {Switch, Route, useHistory} from 'react-router-dom'

// ---------- Components ----------
import RegisterWallet from "./components/CHAPI/registerWallet";
import CredentialRequest from "./components/CHAPI/credentialRequest";
import CredentialStore from "./components/CHAPI/credentialStore";
import Welcome from './components/welcome';
// --------------------------------

function Routes() {
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
                </Route>
                <Route path="/register" exact>
                    <RegisterWallet/>
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

export default Routes