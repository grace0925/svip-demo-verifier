import React from 'react'

import * as polyfill from 'credential-handler-polyfill'
import JSONPretty from "react-json-pretty";
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import _ from 'lodash'
import axios from 'axios'
import {Container, Button, Spinner, Modal} from 'react-bootstrap'


class GetVC extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            originalVC: {},
            vc: {},
            showVC: false,
            spinnerOn: false,
            verified: false,
            redirect: false,
            cookie: "",
        };

        this.handleGet = this.handleGet.bind(this);
        this.verifyVC = this.verifyVC.bind(this);
        this.continue = this.continue.bind(this);
        // load CHAPI
        (async () => {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
        })();
    }

    async handleGet() {
        const credentialQuery = JSON.parse('{"web": {"VerifiablePresentation": {}}}');
        const result = await navigator.credentials.get(credentialQuery);
        console.log("receive VC from CHAPI => ", result)
        let temp = _.cloneDeep(result.data)
        temp.credentialSubject.image = temp.credentialSubject.image.substr(0, 40) + "..." + temp.credentialSubject.image.substr(-30)
        this.setState({
            originalVC: result.data,
            vc: temp,
            showVC: true,
        })
    }

    async verifyVC() {
        let res;
        try {
            this.setState({
                spinnerOn: true,
            })
            res = await axios.post('https://' + `${process.env.REACT_APP_HOST}` + '/verifyVC', this.state.originalVC)
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

    continue() {
        this.props.onImgEncode(this.state.originalVC.credentialSubject.image)
        this.setState({redirect: true})
    }

    componentDidMount() {
        this.handleGet()
    }

    render() {
        const {vc, showVC, spinnerOn, verified, redirect} = this.state;
        if (redirect) {
            return <Redirect push to="/jobBoard"/>
        }
        return (
            <div className="light-grey-background">
                {showVC ? (
                    <div>
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
                                    <div>
                                        <Button className="verified-status" disabled block>Verified</Button>
                                        <Button onClick={this.continue} className="light-btn move-right mb-5 mt-4">Continue</Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Button className="not-verified-status" disabled block>Not Verified</Button>
                                        <Button onClick={this.verifyVC} className="light-btn move-right mb-5 mt-4">Verify</Button>
                                    </div>
                                    )}
                            </div>
                        </Container>
                        <Modal size="sm" show={spinnerOn} centered >
                            <Modal.Body className="m-4 txt-center montserrat-fonts">
                                {spinnerOn ? (
                                    <div>
                                        <Spinner className="center p-5 verifier-spinner mt-4 mb-4" animation="border" variant="success"/>
                                        <h6 className="mb-3 txt-center">Verifying your VC...</h6>
                                    </div>
                                ) :null}
                            </Modal.Body>
                        </Modal>
                    </div>
                ) : null}
            </div>
        )
    }
}

export default GetVC