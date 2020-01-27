import React, {useState} from 'react'

import {Switch, Route, useHistory} from 'react-router-dom'

import IssueCred from './components/issueCred'
import DemoOptions from './components/demoOptions'
import DisplayCred from './components/displayCred'

function Routes() {
    const [choice, setChoice] = useState(0);
    const [name, setName] = useState('');
    const history = useHistory();

    const handleChoice = (choiceVal) => {
        setChoice(choiceVal)
        history.push("/issue")
    };

    const handleName = (name) => {
        setName(name)
    };

    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <DemoOptions onChoice={handleChoice}/>
                </Route>
                <Route path="/issue" exact>
                    <IssueCred egChoice={choice} onName={handleName}/>
                </Route>
                <Route path="/credential" exact>
                    <DisplayCred name={name}/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes