import React from 'react'

import {Container, Row, Col} from 'react-bootstrap'
import {Input, Icon, Button, Divider, Dropdown, List, Segment, Item, Rating, Label, Menu} from 'semantic-ui-react'

import "../../stylesheets/common.css"
import "../../stylesheets/getVC.css"

import JobBoardSearch from "./jobBoardSearch";
import JobBoardDisplay from "./jobBoardDisplay";


function JobBoard(){
    return(
        <div className="light-grey-background">
            <Container>
                <div className="verifier-box p-4 mb-4">
                    <JobBoardSearch/>
                    <Divider section/>
                    <JobBoardDisplay/>
                </div>
            </Container>
        </div>
    )

}

export default JobBoard