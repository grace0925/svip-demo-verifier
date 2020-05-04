import React from 'react'
import {Card, Col, ListGroup, Row, Collapse} from "react-bootstrap";
import {Button, Form, TextArea} from "semantic-ui-react";
import {IoMdPerson} from "react-icons/io";

class DashboardItems extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            vcListString: "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://w3id.org/citizenship/v1\",\"https://trustbloc.github.io/context/vc/examples-v1.jsonld\"],\"credentialStatus\":{\"id\":\"https://issuer.sandbox.trustbloc.dev/status/2\",\"type\":\"CredentialStatusList2017\"},\"credentialSubject\":{\"id\":\"did:trustbloc:testnet.trustbloc.dev:EiCG32_WbFGQKncGrxGuQ864GUVEYhKA7MT0RnMoO6m1O\",\"type\":[\"PermanentResident\",\"Person\"],\"givenName\":\"Rick\",\"familyName\":\"Brown\",\"gender\":\"Male\",\"image\":\"data:image/png;base64,iVBORw0KGgoAAAANSU...//gM5+v4mZO1oAAAAASUVORK5CYII=\",\"residentSince\":\"2000-09-25\",\"lprCategory\":\"C09\",\"lprNumber\":\"193-485-782\",\"commuterClassification\":\"C1\",\"birthCountry\":\"Austria\",\"birthDate\":\"1984-02-18\"},\"description\":\"Permanent Resident Card\",\"expirationDate\":\"2030-06-04T16:26:40-04:00\",\"id\":\"https://issuer.oidp.uscis.gov/credentials/83627465\",\"issuanceDate\":\"2020-05-04T16:26:40-04:00\",\"issuer\":\"did:trustbloc:testnet.trustbloc.dev:EiBIHmMJx1Uy_GNnUuweFSDZcRw1-K3rIsUlv-xFsHmkSg\",\"name\":\"Permanent Resident Card\",\"proof\":{\"created\":\"2020-05-04T20:26:42Z\",\"jws\":\"eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..RRf2azI-0mTQ5S-xRFfNxpoKSYgKOPlk2ddYRKJNyiDE_bJ37eDAK4jXOoTkov8dEm1bUeK9BNwa4hm_pl_6AQ\",\"proofPurpose\":\"assertionMethod\",\"type\":\"Ed25519Signature2018\",\"verificationMethod\":\"did:trustbloc:testnet.trustbloc.dev:EiBIHmMJx1Uy_GNnUuweFSDZcRw1-K3rIsUlv-xFsHmkSg#key-1\"},\"type\":[\"VerifiableCredential\",\"PermanentResidentCard\"]}",
            vcList: props.vcList,
        };
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        let listCopy = this.state.vcList
        for (let i = 0; i < listCopy.length; i++) {
            this.state.vcList[i].show = false;
            this.state.vcList[i].index = i;
        }
        const stringList = listCopy.map(item =>
            JSON.stringify(item)
        );
        console.log("list copy => ", listCopy)
        // TODO: actually display vcs
        this.setState({vcList: listCopy, vcListString: stringList})
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
                                <TextArea className="mt-2 txt-area" readOnly>{this.state.vcListString}</TextArea>
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