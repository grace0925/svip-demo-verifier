import React from 'react'
import {Col, Row} from "react-bootstrap";
import {Button, Icon, Input} from "semantic-ui-react";

function JobBoardSearch() {
    return(
        <Row className="mx-md-3 px-md-3 ml-1 mt-1">
            <Col id="job-title-input">
                <Input fluid icon iconPosition='left' placeholder="Search Jobs...">
                    <input />
                    <Icon name='industry'/>
                </Input>
            </Col>
            <Col id="job-location-input">
                <Input fluid icon iconPosition='left' placeholder="Search Location...">
                    <input />
                    <Icon name='location arrow'/>
                </Input>
            </Col>
            <Col id="job-search">
                <Button>Find Jobs</Button>
                <a className="ml-3 ">Advanced search</a>
            </Col>
        </Row>
    )
}

export default JobBoardSearch