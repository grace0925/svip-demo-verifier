import React from 'react'

import OpenWalletInfo from "./openWalletInfo";
import OpenWalletBlueBanner from "./openWalletBlueBanner";

import "../../stylesheets/getVC.css"

class OpenWallet extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div className="light-grey-background extra-padding">
               <OpenWalletInfo/>
               <OpenWalletBlueBanner/>
            </div>
        )
    }
}

export default OpenWallet