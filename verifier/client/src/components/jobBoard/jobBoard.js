import React from 'react'

import {Container} from 'react-bootstrap'
import {Divider} from 'semantic-ui-react'

import "../../stylesheets/common.css"
import "../../stylesheets/getVC.css"

import JobBoardSearch from "./jobBoardSearch";
import JobBoardDisplay from "./jobBoardDisplay";


function JobBoard(){
    return(
        <div className="light-grey-background">
            <Container>
                <div className="verifier-box p-4 mb-4">
                    <h2 className="bold-h2">Job Board</h2>
                    <JobBoardSearch/>
                    <Divider section/>
                    <JobBoardDisplay/>
                </div>
            </Container>
        </div>
    )

}

export default JobBoard