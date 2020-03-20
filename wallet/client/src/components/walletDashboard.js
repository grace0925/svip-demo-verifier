import React from 'react'

import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'
import axios from 'axios'

import RegisterWallet from "./CHAPI/registerWallet";
import SignupComplete from "./signupComplete";
import DashboardItems from "./dashboardItems";

import {Container, Row, Col, Alert, Accordion, Card, ListGroup} from 'react-bootstrap'
import {Form, TextArea, Button} from "semantic-ui-react";
import {IoMdPerson} from 'react-icons/io'
import "../stylesheets/common.css"
import "../stylesheets/dashboard.css"

class WalletDashboard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            vcList: [],
            vcListString: [],
            showVCs: false,
            registerWallet: false,
            showFinishRegister: false,
        }
        this.registerWallet = this.registerWallet.bind(this);
        this.handleCloseFinishModal = this.handleCloseFinishModal.bind(this);
        this.handleFinishedRegistration = this.handleFinishedRegistration.bind(this);
        this.decodeToken = this.decodeToken.bind(this);
    }

    componentDidMount() {
        this.decodeToken();
        this.getAllVC()
    }

    decodeToken() {
        let decoded = jwtDecode(Cookies.get("wallet_token"))
        this.setState({
            username : decoded.username.toUpperCase(),
        })
    }

    async getAllVC() {
        let res;
        try {
            let cookie = Cookies.get("wallet_token")
            res = await axios.get('https://' + `${process.env.REACT_APP_HOST}` + '/getVc?token=' + cookie)
            this.setState({
                vcList: res.data,
            });
            const stringList = this.state.vcList.map(item =>
                JSON.stringify(item)
            );
            this.setState({
                vcListString: stringList,
                showVCs: true,
            });
        } catch(e) {
            console.log(e)
        }
    }

    registerWallet() {
        this.setState({
            registerWallet: true,
        })
    }

    handleFinishedRegistration = (finished) => {
        if (finished) {
            this.setState({
                showFinishRegister: true,
            })
        }
    };

    handleCloseFinishModal = (close) => {
        if (close) {
            this.setState({
                showFinishSignup: false,
            })
        }
    };

    render() {
        const {username, registerWallet, showFinishRegister, showVCs} = this.state
        return(
            <div className="dashboard">
                <h2>{username}'S CREDENTIAL WALLET</h2>
                <Alert className="mt-5" show={true} variant="success">If something is wrong with your wallet registration, <Alert.Link onClick={this.registerWallet}>Click here to register again!</Alert.Link></Alert>
                {registerWallet ? (
                    <RegisterWallet onFinished={this.handleFinishedRegistration}/>
                ) : null}
                {showFinishRegister ? (<SignupComplete showModal={showFinishRegister} onCloseModal={this.handleCloseFinishModal}/>) : null}
                {showVCs ? (
                    <DashboardItems vcList={this.state.vcList} vcListString={this.state.vcListString}/>) : null }
            </div>
        )
    }
}

export default WalletDashboard