import React, {useState} from 'react'
import {Switch, Route, useHistory} from 'react-router-dom'
import IssueCred from './components/issueCred'
import DemoOptions from './components/demoOptions'

function Routes() {
    const [choice, setChoice] = useState(0)
    const history = useHistory()

    const handleChoice = (choiceVal) => {
        setChoice(choiceVal)
        history.push("/issue")
    }
    return(
        <main>
            <Switch>
                <Route path="/" exact>
                    <DemoOptions onChoice={handleChoice}/>
                </Route>
                <Route path="/issue" exact>
                    <IssueCred egChoice={choice}/>
                </Route>
            </Switch>
        </main>
    )
}

export default Routes