import React from 'react'

// ---------- Modules ----------
import {Switch, Route, useHistory} from 'react-router-dom'
// -----------------------------

// ---------- Components ----------
import Welcome from './components/welcome'
import Verify from './components/verify'
import Done from './components/done'
import GetVCBackground from './components/getVCBackground'
// --------------------------------

function Routes() {
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
                </Route>
                <Route path="/getVC" exact>
                    <GetVCBackground/>
                </Route>
                <Route path="/verify">
                    <Verify/>
                </Route>
                <Route path="/done">
                    <Done/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes