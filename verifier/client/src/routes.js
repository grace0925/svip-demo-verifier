import React, {useState} from 'react'

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

class Routes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: "",
            name: "",
        }
        this.handleImg = this.handleImg.bind(this);
        console.log("route constructing")
    }

    handleImg = (img) => {
        this.setState({image: img})
        this.props.onimgEncode(img)
    }

    handleName = (name) => {
        this.setState({name: name})
        this.props.onName(name)
    }

    componentWillMount() {
        console.log("route mounting")
    }

    render() {
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
                        <GetVC onImgEncode={this.handleImg} onName={this.handleName}/>
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

}

export default Routes