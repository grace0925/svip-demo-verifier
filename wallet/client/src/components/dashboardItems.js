import React from 'react'
import {Card, Col, ListGroup, Row, Collapse} from "react-bootstrap";
import {Button, Form, TextArea} from "semantic-ui-react";
import {IoMdPerson} from "react-icons/io";

class DashboardItems extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            vcListString: "",
            vcList: props.vcList,
        };
        this.toggle = this.toggle.bind(this);
    }

    componentWillMount() {
        let listCopy = this.state.vcList
        for (let i = 0; i < listCopy.length; i++) {
            this.state.vcList[i].show = false;
            this.state.vcList[i].index = i;
        }
        const stringList = listCopy.map(item =>
            JSON.stringify(item)
        );
        this.setState({
            vcList: listCopy,
            vcListString: stringList,
        })
    }

    toggle(index) {
        this.setState(({vcList}) => ({
            vcList: [
                ...vcList.slice(0,index),
                {
                    ...vcList[index],
                    show: !vcList[index].show,
                },
                ...vcList.slice(index+1)
            ],
        }));
    }

    render() {

        const cards = this.state.vcList.map((vcListItem) =>(
            <Col xs={12} lg={3} md={6}>
                <ListGroup>
                    <ListGroup.Item variant="primary" onClick={()=>this.toggle(vcListItem.index)} aria-controls={vcListItem.friendlyName} aria-expanded={vcListItem.show}>
                        <Row className="align-vertical-center">
                            <Col>
                                <IoMdPerson size="8rem"/>
                            </Col>
                            <Col className="vc-title">
                                {vcListItem.friendlyName}
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
                <Collapse in={vcListItem.show}>
                    <Card className="mb-5" id={vcListItem.friendlyName}>
                        <Card.Body>
                            <Form>
                                <TextArea className="mt-2 txt-area" readOnly>{this.state.vcListString[vcListItem.index]}</TextArea>
                                <Button onClick={()=>this.toggle(vcListItem.index)} className="mt-2 float-right" primary>Close</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Collapse>
            </Col>));

        return(
            <Row>
                {cards}
            </Row>
        )
}
}

export default DashboardItems