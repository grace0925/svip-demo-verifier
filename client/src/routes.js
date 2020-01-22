import React from 'react'
import {Switch, Route} from 'react-router-dom'
import issueCred from './components/issueCred'

const Routes = () => (
    <main>
        <Switch>
            <Route path="/" exact component={issueCred}/>
        </Switch>
    </main>
);

export default Routes