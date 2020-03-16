import React from 'react'

import * as polyfill from 'credential-handler-polyfill'
import JSONPretty from "react-json-pretty";
import Cookies from 'js-cookie'
import axios from 'axios'
import {Container, Button, Spinner} from 'react-bootstrap'


class GetVC extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            vc: {},
            showVC: false,
            spinnerOn: false,
            verified: false,
        };

        this.handleGet = this.handleGet.bind(this);
        this.verifyVC = this.verifyVC.bind(this);
        // load CHAPI
        (async () => {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
        })();
    }

    async handleGet() {
        // CHAPI breaks with cookie?
        if (Cookies.get("wallet_token") !== undefined) {
            Cookies.remove("wallet_token");
        }
        const credentialQuery = JSON.parse('{"web": {"VerifiablePresentation": {}}}');
        const result = await navigator.credentials.get(credentialQuery);
        console.log("receive VC from CHAPI => ", result)
        this.setState({
            vc: result.data,
            showVC: true,
        })
    }

    async verifyVC() {
        let res;
        try {
            this.setState({
                spinnerOn: true,
            })
            res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/verifyVC', this.state.vc)
        } catch (e) {
            console.log(e)
        }
        if (res !== undefined && res.data) {
            this.setState({
                verified: true,
                spinnerOn: false,
            })
        } else {
            this.setState({
                verified: false,
                spinnerOn: false,
            })
        }
    }

    componentDidMount() {
        this.handleGet()
    }

    render() {
        const {vc, showVC, spinnerOn, verified} = this.state;
        return (
            <div className="light-grey-background">
                {showVC ? (
                    <Container>
                        <div className="verifier-box extra-bottom p-4">
                            <h4 className="darkblue">Confirm that this is the VC that you'd like to verify:</h4>
                            <a href="/getVC">Selected the wrong VC?</a>
                            <JSONPretty json={this.state.vc} mainStyle="padding:1em" space="3" theme={{
                                main: 'line-height:0.9;color:#00008b;background:#ffffff;overflow:auto;',
                                error: 'line-height:0.9;color:#66d9ef;background:#272822;overflow:auto;',
                                key: 'color:#f92672;',
                                string: 'color:#2B7942;',
                                value: 'color:#2B7942;',
                                boolean: 'color:#0000B3;',
                            }}/>
                            {verified ? (
                                <Button className="verified-status" disabled block>Verified</Button>
                            ) : (
                                <Button className="not-verified-status" disabled block>Not Verified</Button>
                            )}
                            {spinnerOn ? (
                                <Spinner className="center mt-3" animation="border" variant="primary"/>
                            ) : null}
                            <Button onClick={this.verifyVC} className="light-btn move-right mb-5 mt-4">Verify</Button>
                        </div>
                    </Container>
                ) : null}
            </div>
        )
    }
}

export default GetVC