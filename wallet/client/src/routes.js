import React from 'react'
import {Switch, Route, useHistory} from 'react-router-dom'

// ---------- Components ----------
import RegisterWallet from "./components/registerWallet";
import CredentialRequest from "./components/credentialRequest";
import CredentialStore from "./components/credentialStore";
import Welcome from './components/welcome';
// --------------------------------

function Routes() {
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
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