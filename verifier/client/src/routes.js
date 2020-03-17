import React from 'react'

// ---------- Modules ----------
import {Switch, Route, useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Components ----------
import Welcome from './components/welcome'
import GetVC from './components/getVC'
import Done from './components/done'
import OpenWallet from './components/openWallet'
import Signup from './components/signup'
import Login from './components/login'
// --------------------------------

function Routes() {
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
                </Route>
                <Route path="/openWallet" exact>
                    <OpenWallet/>
                </Route>
                <Route path="/getVC">
                    <GetVC/>
                </Route>
                <Route path="/done">
                    <Done/>
                </Route>
                <Route path="/signup">
                    <Signup/>
                </Route>
                <Route path="/login">
                    <Login/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes