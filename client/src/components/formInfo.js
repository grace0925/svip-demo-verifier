import React from 'react'
import axios from 'axios'

import {Redirect} from 'react-router-dom'
import countryList from 'react-select-country-list'
import MaskedFormControl from "react-bootstrap-maskedinput/src";
import InputMask from 'react-input-mask'

import '../stylesheets/common.css'
import {Container, Form, Col, Button, Spinner, Row} from "react-bootstrap";

class FormInfo extends React.Component {
    constructor(props) {
        super(props);
        this.options = countryList().getData()
        this.state = {
            countryOptions: this.options,
            installed: false,
            givenName: '',
            familyName: '',
            gender: '',
            birthCountry: '',
            residentSince: new Date().toISOString(),
            lprCategory: '',
            lprNumber: '',
            issuanceDate: new Date().toISOString(),
            expirationDate: new Date().toISOString(),
            mrzInformation: 'IAUSA0000007032SRC0000000703<<2001012M1105108BRA<<<<<<<<<<<5SPECIMEN<<TEST<VOID<<<<<<<<<<<',
            spinnerOn: false,
            redirect: false,
            birthDate: new Date().toISOString(),
            vcInfo: {},
        }
    }

    async issueCredPost(obj) {
        let res = await axios.post('https://localhost:8080/userInfo', obj);
        console.log(res.data);
    }

    createCountryDropdownItems() {
        let items = this.state.countryOptions;
        let countryOptions = [<option key={0}>Select...</option>];
        for (let i = 0; i < items.length; i++) {
            countryOptions.push(<option key={items[i].value}>{items[i].label}</option>)
        }
        return countryOptions;
    }

    submitHandler = e => {
        e.preventDefault();
        const vcInfo = {
            credentialSubject: {
                type: "Person",
                givenName: this.state.givenName,
                familyName: this.state.familyName,
                gender: this.state.gender,
                residentSince: this.state.residentSince,
                lprCategory: this.state.lprCategory,
                lprNumber: this.state.lprNumber,
                birthCountry: this.state.birthCountry,
                birthDate: this.state.birthDate,
                mrzInformation: this.state.mrzInformation,
            },
            issuanceDate: this.state.issuanceDate,
            expirationDate: this.state.expirationDate,
        };
        this.setState({
            vcInfo: vcInfo,
        })
        console.log(this.state)
        this.issueCredPost(vcInfo);
        this.loadBtn();
        this.props.onID(vcInfo.credentialSubject.lprNumber);
    };

    loadBtn = () => {
        this.setState({
            spinnerOn: true
        });
        setTimeout(function() {
            this.setState({
                spinnerOn: false,
                redirect: true
            })
        }.bind(this), 2000)
    }

    formChangeHandler = e => {
        console.log("on change ", e.target.name)
        this.setState({
            [e.target.name]: e.target.value
        })
        console.log(this.state)
    };

    handleDefaultProfile = () => {
        this.setState({
            givenName: "Rick",
            familyName: "Brown",
            gender: "Male",
            birthCountry: "Austria",
            residentSince: "2000-09-25",
            lprCategory: "C09",
            lprNumber: "193-485-782",
            issuanceDate: "2014-11-04",
            expirationDate: "2024-11-04",
            mrzInformation: "P<USABROWN<<RICK<<<<<<<<<<<<<<<<<<<<<<<<<<<<1934857829USA7402189M2411034205995658<269627",
            birthDate: "1984-02-18",
        })
    };

    render() {
        const {givenName, familyName, residentSince, spinnerOn, birthDate, mrzInformation,
            issuanceDate, expirationDate, lprCategory, lprNumber} = this.state;
        const letter = /[A-Z]+/;
        const number = /[0-9]/;
        const both = /[A-Z0-9]+/;
        const mask = [letter, both, number];
        if (this.state.redirect === true) {
            return <Redirect push to='/vcReady'/>
        }
        return(
            <Container className="py-5">
                <Row>
                    <Col className="form-space"> </Col>
                </Row>
                <h1 className="txt-center">Fill in this form to issue a verifiable credential!</h1>
                <p className="txt-center">This will only take a few seconds.</p>
                <hr/>

                <Form onSubmit={this.submitHandler} className="px-5" >
                    <h4>1. Basic Information</h4>
                    <Form.Row className="mt-4">
                        <Col xs={5}>
                            <Form.Group>
                                <Form.Label className="txt-left">Given Name</Form.Label>
                                <InputMask placeholder="John" name="givenName" className="bootstrap-box" onChange={this.formChangeHandler} value={givenName}/>
                            </Form.Group>

                        </Col>
                        <Col xs={5}>
                            <Form.Group>
                                <Form.Label className="txt-left">Family Name</Form.Label>
                                <InputMask placeholder="Doe" name="familyName" className="bootstrap-box" onChange={this.formChangeHandler} value={familyName}/>
                            </Form.Group>
                        </Col>
                        <Col xs={2}>
                            <Form.Group>
                                <Form.Label className="txt-left">Gender</Form.Label>
                                <Form.Control name="gender" as="select" onChange={this.formChangeHandler} value={this.state.gender}>
                                    <option>Select...</option>
                                    <option>Female</option>
                                    <option>Male</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Row>
                        <Col xs={4}>
                            <Form.Group>
                                <Form.Label className="txt-left">Resident Since</Form.Label>
                                <Form.Control type="date" name="residentSince"
                                              value={residentSince} onChange={this.formChangeHandler}/>
                            </Form.Group>
                        </Col>
                        <Col xs={4}>
                            <Form.Group>
                                <Form.Label className="txt-left">Birth Date</Form.Label>
                                <Form.Control type="date" name="birthDate"
                                              value={birthDate} onChange={this.formChangeHandler}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={4}>
                            <Form.Group>
                                <Form.Label className="txt-left">Birth Country</Form.Label>
                                <Form.Control name="birthCountry" as="select" onChange={this.formChangeHandler} value={this.state.birthCountry}>
                                    {this.createCountryDropdownItems()}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Form.Row>

                    <hr/>

                    <h4>2. PR Card Information</h4>
                    <Form.Row className="mt-4">
                        <Col xs={3}>
                            <Form.Group>
                                <Form.Label className="txt-left">Issuance Date</Form.Label>
                                <Form.Control type="date" name="issuanceDate"
                                              value={issuanceDate} onChange={this.formChangeHandler}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={3}>
                            <Form.Group>
                                <Form.Label className="txt-left">Expiration Date</Form.Label>
                                <Form.Control type="date" name="expirationDate"
                                              value={expirationDate} onChange={this.formChangeHandler}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={2}>
                            <Form.Group>
                                <Form.Label className="txt-left">Category</Form.Label>
                                <InputMask placeholder="RE1" name="lprCategory" className="bootstrap-box" onChange={this.formChangeHandler} value={lprCategory} mask={mask}/>
                            </Form.Group>
                        </Col>
                        <Col xs={4}>
                            <Form.Group>
                                <Form.Label className="txt-left">USCIS Number</Form.Label>
                                <InputMask placeholder="000-000-000" name="lprNumber" className="bootstrap-box" onChange={this.formChangeHandler} value={lprNumber} mask="999-999-999"/>
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="txt-left">mrzInformation</Form.Label>
                                <Form.Control value={mrzInformation} name="mrzInformation"
                                              onChange={this.formChangeHandler}
                                              placeholder={mrzInformation}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Button className="float-right" size="sm" variant="outline-primary" onClick={this.handleDefaultProfile}>Use Default</Button>
                    <br/>
                    <hr/>

                    {spinnerOn ? (<Button className="issueBtn" variant="primary mt-2" disabled>
                                    <Spinner animation="grow" size="sm" className="mr-3"/>
                                    Loading</Button>)
                        : <Button className="issueBtn" variant="primary mt-2" type="submit">
                                Done
                    </Button>}
                </Form>
            </Container>
        );
    }
}

export default FormInfo

