import React from 'react'

// ---------- Modules ----------
import {Switch, Route, useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Components ----------
import Welcome from './components/welcome'
import GetVC from './components/getVC'
import Done from './components/done'
import OpenWallet from './components/openWallet/openWallet'
import JobBoard  from "./components/jobBoard/jobBoard";
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
                <route path="/jobBoard">
                    <JobBoard/>
                </route>
            </Switch>
        </main>
    )
}

export default Routes