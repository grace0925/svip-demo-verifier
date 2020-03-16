import React from 'react'

import {useHistory} from 'react-router-dom'

import {Button} from 'react-bootstrap'
import "../stylesheets/common.css"
import "../stylesheets/getVC.css"

function OpenWalletBlueBanner() {
    let history = useHistory();

    function handleGetCred() {
        history.push("/getVC")
    }

    return(
        <div className="light-blue-banner mt-5 txt-center py-5">
            <h4>CLICK HERE TO START VERIFYING YOUR CREDENTIAL</h4>
            <Button onClick={handleGetCred} className="light-btn mt-5">GET CREDENTIAL</Button>
        </div>
    )
}

export default OpenWalletBlueBanner