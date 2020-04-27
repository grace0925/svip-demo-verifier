import React from 'react'

import axios from 'axios'
import Cookies from 'js-cookie'
import Login from '../login'

import {Button, Container, Row, FormControl, ProgressBar} from "react-bootstrap";

class CredentialStore extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            vc: {},
            friendlyName: '',
            confirmed: false,
            progress: 0,
            loggedIn: false,
            rememberMe: "",
        }
        this.store = this.store.bind(this);
        this.progressBar = this.progressBar.bind(this);
        this.cancel = this.cancel.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.handleRememberMe = this.handleRememberMe.bind(this);
        this.clearCookie = this.clearCookie.bind(this);

    }

    componentDidMount() {
        window.addEventListener('message', event => {
            console.log("hard coded credential data => ", event.data.credential.data)
            this.setState({
                vc: event.data.credential.data,
                temp: event.data.credential.data,
            })
        });

        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
        if (Cookies.get("wallet_token") !== undefined) {
            this.setState({loggedIn: true})
        }
    }

    handleRememberMe(rememberMe) {
        this.setState({rememberMe: rememberMe})
    }

    clearCookie() {
        if (this.state.rememberMe === "false") {
            Cookies.remove("wallet_token")
        }
    }

    async progressBar() {
        this.setState({
            confirmed: true,
        })
        let i = 0;
        setInterval(function() {
            if (i === 101) {
                clearInterval(this);
            } else {
                this.setState({
                    progress: i,
                });
                i++;
            }
        }.bind(this), 20)
    }

    async store() {
        await this.progressBar();

        let vc = this.state.vc;
        vc.friendlyName = this.state.friendlyName;
        vc.verified = false;
        console.log("store this vc => ", vc)
        axios.defaults.withCredentials = false;
        const options = {
            withCredentials: true
        }
        try {
            const config = {
                headers: { Authorization: 'Bearer' + Cookies.get("wallet_token")},
                withCredentials: true,
            }
            const res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/storeVC', vc, config)
            this.clearCookie();
            setTimeout(function() {
                window.parent.postMessage(
                    {
                        type: "response",
                        credential: {
                            dataType: "VerifiablePresentation",
                            data: vc,
                        }
                    }, window.location.origin);
            }, 4000)
        } catch (e) {
            console.log(e)
            this.clearCookie()
            window.parent.postMessage(
                {
                    type: "response",
                    credential: {
                        dataType: "VerifiablePresentation",
                        data: e,
                    }
                },
                window.location.origin
            )
        }

    }

    cancel() {
        this.clearCookie()
        window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: null,
                }
            },
            window.location.origin
        );
    }

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    handleLoggedIn = (loggedIn) => {
        this.setState({
            loggedIn: loggedIn
        })
    };

    render() {
        return(
            <Container>
                {this.state.loggedIn ? (
                    <div>
                        <Row className="ready-space"> </Row>
                        <h5>Give this VC a friendly name so it's easier for you to remember next time:</h5>
                        <FormControl placeholder="Friendly Name" className="mb-3" value={this.state.friendlyName} name="friendlyName" onChange={this.formChangeHandler}/>
                        <h5>Are you sure you want to store this VC in your wallet?</h5>
                        {this.state.confirmed ? (<ProgressBar className="mt-3" striped animated now={this.state.progress}/>) : null}
                        <Row className="mt-5 float-right">
                            {this.state.confirmed ? null : (<Button variant="success mr-3" onClick={this.store}>Confirm</Button>)}
                            {this.state.confirmed ? null : (<Button variant="outline-danger" onClick={this.cancel}>Cancel</Button>)}
                        </Row>
                    </div>
                ) : (
                    <div>
                        <Login showModal={!this.state.loggedIn} onCloseModal={this.handleLoggedIn} onRememberMe={this.handleRememberMe}/>
                        <Row className="ready-space"> </Row>
                        <h5>You have to be logged in to your wallet to continue.</h5>
                    </div>
                )}

            </Container>
        )
    }
}

export default CredentialStore