import React from 'react'

// ---------- Modules ----------
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import countryList from 'react-select-country-list'
import InputMask from 'react-input-mask'
// -----------------------------

// ---------- Styles ----------
import '../stylesheets/common.css'
import {Container, Form, Col, Button, ProgressBar, Row} from "react-bootstrap";
import {FaCheckCircle} from 'react-icons/fa';
// ----------------------------

class InfoForm extends React.Component {
    constructor(props) {
        super(props);
        this.options = countryList().getData(); // load country dropdown options
        this.state = {
            countryOptions: this.options,
            // ----- form information -----
            givenName: '',
            familyName: '',
            gender: '',
            birthCountry: '',
            residentSince: new Date().toISOString(),
            lprCategory: '',
            lprNumber: '',
            commuterClassification: '',
            issuanceDate: new Date().toISOString(),
            expirationDate: new Date().toISOString(),
            birthDate: new Date().toISOString(),
            // -----------------------------
            // ----- spinner -----
            spinnerOn: false,
            progress: 0,
            redirect: false,
            // -------------------
            vcInfo: {},
        };
        this.submitHandler = this.submitHandler.bind(this);
        this.issueCredPost = this.issueCredPost.bind(this);
        this.loadBtn = this.loadBtn.bind(this);
        this.createCountryDropdownItems = this.createCountryDropdownItems.bind(this);
        this.formChangeHandler = this.formChangeHandler.bind(this);
        this.handleDefaultProfile = this.handleDefaultProfile.bind(this);
    }

    async issueCredPost(obj) {
        let sessionId = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
        const newObj = Object.assign({
            sessionId: sessionId
        }, obj);
        // store user information in database
        let res = await axios.post('https://localhost:8080/storeUserInfo', newObj);
        this.props.onID(sessionId)
    }

    createCountryDropdownItems() {
        let items = this.state.countryOptions;
        let countryOptions = [<option key={0}>Select...</option>];
        for (let i = 0; i < items.length; i++) {
            countryOptions.push(<option key={items[i].value}>{items[i].label}</option>)
        }
        return countryOptions;
    }

    submitHandler(e){
        e.preventDefault();
        const vcInfo = {
            credentialSubject: {
                type: ["Person", "PermanentResident"],
                givenName: this.state.givenName,
                familyName: this.state.familyName,
                gender: this.state.gender,
                residentSince: this.state.residentSince,
                lprCategory: this.state.lprCategory,
                lprNumber: this.state.lprNumber,
                commuterClassification: this.state.commuterClassification,
                birthCountry: this.state.birthCountry,
                birthDate: this.state.birthDate,
            },
            issuanceDate: this.state.issuanceDate,
            expirationDate: this.state.expirationDate,
        };
        this.setState({
            vcInfo: vcInfo,
        })
        this.issueCredPost(vcInfo);
        this.loadBtn();
    };

    loadBtn(){
        var i = 0;
        this.setState({
            spinnerOn: true
        });
        setTimeout(function() {
            this.setState({
                redirect: true
            })
        }.bind(this), 4000)
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

    formChangeHandler = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
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
            commuterClassification: "C1",
            issuanceDate: "2014-11-04",
            expirationDate: "2024-11-04",
            birthDate: "1984-02-18",
        })
    };

    render() {
        const {givenName, familyName, residentSince, spinnerOn, birthDate,
            issuanceDate, expirationDate, lprCategory, lprNumber, commuterClassification} = this.state;
        // -----input masks-----
        const letter = /[A-Z]+/;
        const number = /[0-9]/;
        const both = /[A-Z0-9]+/;
        const LPRmask = [letter, both, number];
        const comMask = [letter, number];
        // ----------------------
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
                                <Form.Control placeholder="John" name="givenName" onChange={this.formChangeHandler} value={givenName}/>
                            </Form.Group>

                        </Col>
                        <Col xs={5}>
                            <Form.Group>
                                <Form.Label className="txt-left">Family Name</Form.Label>
                                <Form.Control placeholder="Doe" name="familyName" onChange={this.formChangeHandler} value={familyName}/>
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
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label className="txt-left">Issuance Date</Form.Label>
                                <Form.Control type="date" name="issuanceDate"
                                              value={issuanceDate} onChange={this.formChangeHandler}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
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
                                <InputMask placeholder="RE1" name="lprCategory" className="bootstrap-box" onChange={this.formChangeHandler} value={lprCategory} mask={LPRmask}/>
                            </Form.Group>
                        </Col>
                        <Col xs={5}>
                            <Form.Group>
                                <Form.Label className="txt-left">Commuter Classification</Form.Label>
                                <InputMask placeholder="C2" name="commuterClassification" className="bootstrap-box" onChange={this.formChangeHandler} value={commuterClassification} mask={comMask}/>
                            </Form.Group>
                        </Col>
                        <Col xs={5}>
                            <Form.Group>
                                <Form.Label className="txt-left">USCIS Number</Form.Label>
                                <InputMask placeholder="000-000-000" name="lprNumber" className="bootstrap-box" onChange={this.formChangeHandler} value={lprNumber} mask="999-999-999"/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Button className="float-right" size="sm" variant="outline-primary" onClick={this.handleDefaultProfile}>Use Default</Button>
                    <br/>
                    <hr/>
                    {spinnerOn ? (<ProgressBar striped animated now={this.state.progress}/>) : null}
                    <Button className="issueBtn" variant="primary mt-2" type="submit">Done <FaCheckCircle className="white ml-1 mb-1"/>
                    </Button>
                </Form>
            </Container>
        );
    }
}

export default InfoForm

