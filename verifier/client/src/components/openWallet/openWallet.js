import React from 'react'

import OpenWalletInfo from "./openWalletInfo";
import OpenWalletBlueBanner from "./openWalletBlueBanner";

import {Container, Button, Row, Col} from 'react-bootstrap'
import "../../stylesheets/getVC.css"

class OpenWallet extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div className="light-grey-background">
               <OpenWalletInfo/>
               <OpenWalletBlueBanner/>
            </div>
        )
    }
}

export default OpenWallet