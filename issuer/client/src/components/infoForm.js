import React from 'react'

// ---------- Modules ----------
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import countryList from 'react-select-country-list'
import InputMask from 'react-input-mask'
// -----------------------------

// ---------- Styles ----------
import '../stylesheets/common.css'
import {Container, Form, Col, Button, ProgressBar, Row, Card} from "react-bootstrap";
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
            redirect: false,
            vcInfo: {},
            expand: false,
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
        let res
        try {
            this.props.onID(sessionId)
            this.props.onName(obj.credentialSubject.givenName + " " + obj.credentialSubject.familyName);
            res = await axios.post('https://localhost:8080/storeUserInfo', newObj);
        } catch  (e) {
            console.log(e)
        }
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
            this.setState({
                redirect: true
            })
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
            issuanceDate: "2014-1have1-04",
            expirationDate: "2024-11-04",
            birthDate: "1984-02-18",
        })
    };

    detectScreen = () => {
        if (window.innerWidth <= 768) {
            this.setState({
                expand: true,
            })
        } else {
            this.setState({
                expand: false,
            })
        }
    };

    componentDidMount() {
        window.addEventListener("resize", this.detectScreen.bind(this));
        this.detectScreen()
    }

    render() {
        const {givenName, familyName, residentSince, birthDate,
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
            <div className="dark-background">
                <Container className="py-4">
                    <Card className={`py-5 center shadow ${this.state.expand ? "": "expand-form"}`}>
                        <h2 className="ml-5 form-h2">Sign up </h2>
                        <hr/>

                        <Form onSubmit={this.submitHandler} className="px-5" >
                            <h4>1. Basic Information</h4>
                            <Form.Row className="">
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Given Name</Form.Label>
                                        <Form.Control placeholder="John" name="givenName" onChange={this.formChangeHandler} value={givenName}/>
                                    </Form.Group>

                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Family Name</Form.Label>
                                        <Form.Control placeholder="Doe" name="familyName" onChange={this.formChangeHandler} value={familyName}/>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Gender</Form.Label>
                                        <Form.Control name="gender" as="select" onChange={this.formChangeHandler} value={this.state.gender}>
                                            <option>Select...</option>
                                            <option>Female</option>
                                            <option>Male</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Birth Country</Form.Label>
                                        <Form.Control name="birthCountry" as="select" onChange={this.formChangeHandler} value={this.state.birthCountry}>
                                            {this.createCountryDropdownItems()}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Row>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Resident Since</Form.Label>
                                        <Form.Control type="date" name="residentSince"
                                                      value={residentSince} onChange={this.formChangeHandler}/>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Birth Date</Form.Label>
                                        <Form.Control type="date" name="birthDate"
                                                      value={birthDate} onChange={this.formChangeHandler}
                                        />
                                    </Form.Group>
                                </Col>
                            </Form.Row>

                            <hr/>

                            <h4>2. PR Card Information</h4>
                            <Form.Row className="">
                                <Col xs={12} md={12}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">USCIS Number</Form.Label>
                                        <InputMask placeholder="000-000-000" name="lprNumber" className="bootstrap-box" onChange={this.formChangeHandler} value={lprNumber} mask="999-999-999"/>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={8}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Commuter Classification</Form.Label>
                                        <InputMask placeholder="C2" name="commuterClassification" className="bootstrap-box" onChange={this.formChangeHandler} value={commuterClassification} mask={comMask}/>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="txt-left">Category</Form.Label>
                                        <InputMask placeholder="RE1" name="lprCategory" className="bootstrap-box" onChange={this.formChangeHandler} value={lprCategory} mask={LPRmask}/>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Button className="float-right" size="sm" variant="outline-primary" onClick={this.handleDefaultProfile}>Use Default</Button>
                            <br/>
                            <hr/>
                            <Button className="issueBtn mb-2 mt-2" variant="primary" type="submit">Done</Button>
                        </Form>
                    </Card>
                </Container>
            </div>
        );
    }
}

export default InfoForm

