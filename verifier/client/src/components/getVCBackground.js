import React from 'react'

import GetVCInfo from "./getVCInfo";
import GetVCBlueBanner from "./getVCBlueBanner";

import {Container, Button, Row, Col} from 'react-bootstrap'
import "../stylesheets/getVC.css"

class GetVCBackground extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div className="light-grey-background">
               <GetVCInfo/>
               <GetVCBlueBanner/>
            </div>
        )
    }
}

export default GetVCBackground