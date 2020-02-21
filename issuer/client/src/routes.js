import React, {useState} from 'react'
import {Switch, Route, useHistory} from 'react-router-dom'

// ---------- Components ----------
import InfoForm from './components/infoForm'
import Welcome from './components/welcome'
import DisplayCred from './components/displayCred'
import VcReady from "./components/vcReady";
import Done from './components/done'
// ---------------------------------

function Routes() {
    const [ID, setID] = useState("");
    const [registered, setRegistered] = useState(false);
    const history = useHistory();

    const handleID = (id) => {
        setID(id)
    };

    const handleRegistered = (registered) => {
        setRegistered(registered)
    }

    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <Welcome/>
                </Route>
                <Route path="/infoForm">
                    <InfoForm onID={handleID}/>
                </Route>
                <Route path="/vcReady">
                    <VcReady ID={ID} onRegistered={handleRegistered}/>
                </Route>
                <Route path="/credential/">
                    <DisplayCred registered={registered}/>
                </Route>
                <Route path="/done" exact>
                    <Done/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes