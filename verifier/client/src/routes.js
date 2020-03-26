import React from 'react'

// ---------- Modules ----------
import {Switch, Route, useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Components ----------
import Welcome from './components/welcome'
import GetVC from './components/getVC'
import Done from './components/done'
import OpenWallet from './components/openWallet'
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
            </Switch>
        </main>
    )
}

export default Routes