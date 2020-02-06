import React, {useState} from 'react'

import {Switch, Route, useHistory} from 'react-router-dom'

import FormInfo from './components/formInfo'
import DemoOptions from './components/demoOptions'
import DisplayCred from './components/displayCred'
import CredentialStore from './components/credentialStore'
import VcReady from "./components/vcReady";

function Routes() {
    const [choice, setChoice] = useState(0);
    const [ID, setID] = useState("");
    const history = useHistory();

    const handleChoice = (choiceVal) => {
        setChoice(choiceVal)
        history.push("/issue")
    };

    const handleID = (id) => {
        setID(id)
    };

    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <DemoOptions onChoice={handleChoice}/>
                </Route>
                <Route path="/issue">
                    <FormInfo egChoice={choice} onID={handleID}/>
                </Route>
                <Route path="/vcReady">
                    <VcReady ID={ID}/>
                </Route>
                <Route path="/credential/">
                    <DisplayCred/>
                </Route>
                <Route path="/credentialstore" exact>
                    <CredentialStore/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes