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
    const [choice, setChoice] = useState(0);
    const [ID, setID] = useState("");
    const [registered, setRegistered] = useState(false);
    const history = useHistory();

    const handleChoice = (choiceVal) => {
        setChoice(choiceVal);
        history.push("/infoForm");
    };

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
                    <Welcome onChoice={handleChoice}/>
                </Route>
                <Route path="/infoForm">
                    <InfoForm egChoice={choice} onID={handleID}/>
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