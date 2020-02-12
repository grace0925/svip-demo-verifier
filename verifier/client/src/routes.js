import React from 'react'

import {Switch, Route, useHistory} from 'react-router-dom'

import Welcome from './components/welcome'
import Verify from './components/verify'

function Routes() {
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
                </Route>
                <Route path="/verify">
                    <Verify/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes