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
        }
        this.store = this.store.bind(this);
        this.progressBar = this.progressBar.bind(this);
        this.cancel = this.cancel.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        console.log("token inside store => ", Cookies.get("wallet_token"))
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
        console.log("store this vc => ", vc)

        try {
            const res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/storeVC', vc);
            setTimeout(function() {
                window.parent.postMessage(
                    {
                        type: "response",
                        credential: {
                            dataType: "VerifiableProfile",
                            data: vc,
                        }
                    },
                    window.location.origin
                );
            }, 4000)
        } catch (e) {
            console.log(e)
            window.parent.postMessage(
                {
                    type: "response",
                    credential: {
                        dataType: "VerifiableProfile",
                        data: e,
                    }
                },
                window.location.origin
            )
        }

    }

    cancel() {
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
                <Login showModal={true} onCloseModal={this.handleLoggedIn}/>
                {this.state.loggedIn ? (
                    <div>
                        <Row className="ready-space"> </Row>
                        <h5>Give this VC a friendly name so it's easier for you to remember next time:</h5>
                        <FormControl placeholder="Friendly Name" className="mb-3" value={this.state.friendlyName} name="friendlyName" onChange={this.formChangeHandler}/>
                        <h5>Are you sure you want to store this VC in your wallet?</h5>
                        {this.state.confirmed ? (<ProgressBar className="mt-3" striped animated now={this.state.progress}/>) : null}
                        <Row className="mt-5 float-right">
                            {this.state.confirmed ? null : (<Button variant="success mr-3" onClick={this.store}>Confirm</Button>)}
                            {this.state.confirmed ? null : (<Button variant="danger" onClick={this.cancel}>Cancel</Button>)}
                        </Row>
                    </div>
                ) : (
                    <div>
                        <Row className="ready-space"> </Row>
                        <h5>You have to be logged in to your wallet to continue.</h5>
                    </div>
                )}

            </Container>
        )
    }
}

export default CredentialStore