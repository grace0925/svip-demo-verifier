import React from 'react'

import JSONPretty from "react-json-pretty";
import * as polyfill from 'credential-handler-polyfill/';
import {Redirect, useHistory} from 'react-router-dom'

import {Button, Col, Container, Row} from 'react-bootstrap'
import {FaWallet} from "react-icons/fa";
import axios from "axios";

class DisplayCred extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            vc: '',
            finished: false,
        };
        this.handleLogin = this.handleLogin.bind(this);

        (async () => {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
        })();

    }

    async handleLogin() {
        console.log("saving vc...")
        const credToStore = this.state.vc;
        const credType = 'PermanentResidentCard';
        // eslint-disable-next-line no-undef
        const webCred = new WebCredential(credType, credToStore);
        try {
            const result = await navigator.credentials.store(webCred);
            if (result != null) {
                this.setState({
                    finished: true,
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    async sessionTransfer() {
        let sessionID = window.location.pathname.split("/").pop();
        let res;
        try {
            res = await axios.get('https://localhost:8080/getVC?ID='+sessionID, {crossdomain:true})
            console.log(res)
            this.setState({
                vc: res.data
            })

            this.setState({
                /*vc: {
                    "@context": [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://w3id.org/citizenship/v1"
                    ],
                    "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
                    "type": ["VerifiableCredential", "PermanentResidentCard"],
                    "issuer": "did:example:28394728934792387",
                    "issuanceDate": res.data.issuanceDate,
                    "expirationDate": res.data.expirationDate,
                    "credentialSubject": {
                        "id": "did:example:b34ca6cd37bbf23",
                        "type": "Person",
                        "givenName": res.data.credentialSubject.givenName,
                        "familyName": res.data.credentialSubject.familyName,
                        "gender": res.data.credentialSubject.gender,
                        "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                        "residentSince": res.data.credentialSubject.residentSince,
                        "lprCategory": res.data.credentialSubject.lprCategory,
                        "lprNumber": res.data.credentialSubject.lprNumber,
                        "commuterClassification": res.data.credentialSubject.commuterClassification,
                        "birthCountry": res.data.credentialSubject.birthCountry,
                        "birthDate":res.data.credentialSubject.birthDate,
                    },
                    "proof": {
                        "type": "Ed25519Signature2018",
                        "created": "2020-01-30T03:32:15Z",
                        "jws": "eyJhbGciOiJFZERTQSIsI...wRG2fNmAx60Vi4Ag",
                        "proofPurpose": "assertionMethod",
                        "verificationMethod": "did:example:28394728934792387#keys-7f83he7s8",
                    },
                }*/
            })
            console.log("vc result =>" ,this.state.vc)
        } catch (e){
            console.log(e);
        }

    }

    componentDidMount() {
        this.sessionTransfer()
    }

    render() {
        if (this.state.finished === true) {
            return <Redirect push to='/done'/>
        }
        return (
            <Container id="display-cred">
                <Row>
                    <Col className="form-space">
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h1 className="mb-4">Your VC is Ready! Click Save to save it in your wallet!</h1>
                    <JSONPretty json={this.state.vc} mainStyle="padding:1em" space="4" theme={{
                        main: 'line-height:1.3;color:#00008b;background:#ffffff;overflow:auto;',
                        error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                        key: 'color:#f92672;',
                        string: 'color:#2B7942;',
                        value: 'color:#2B7942;',
                        boolean: 'color:#0000B3;',
                    }}/>
                    </Col>
                </Row>
                <Button className="float-right" onClick={this.handleLogin}>Save <FaWallet className="white ml-1 mb-1"/></Button>
            </Container>
        )
    }
}

//                <Button onClick={this.handleGet}>Get</Button>
export default DisplayCred