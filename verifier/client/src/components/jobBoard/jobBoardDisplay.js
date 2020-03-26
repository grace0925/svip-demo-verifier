import React from 'react'
import {Col, Row} from "react-bootstrap";
import {Button, Divider, Dropdown, Icon, Item, Label, List, Menu, Rating, Segment} from "semantic-ui-react";
import Amazon from "../../assets/amazon.png";
import Securekey from "../../assets/securekey.png";
import Wish from "../../assets/wish.jpg";
import Snap from "../../assets/snap.jpg";

function JobBoardDisplay() {
    const distanceOptions = [
        {key: "1", text: 'Exact Location Only', value: "1"},
        {key: "2", text: 'Within 5 kilometres', value: "2"},
        {key: "3", text: 'Within 10 kilometres', value: "3"},
        {key: "4", text: 'Within 15 kilometres', value: "4"},
        {key: "5", text: 'Within 25 kilometres', value: "5"},
        {key: "6", text: 'Within 50 kilometres', value: "6"},
        {key: "7", text: 'Within 100 kilometres', value: "7"},
    ]
    return(
        <Row className="montserrat-fonts">
            <Col id="job-filter" xs={12} md={3}>
                <div>
                    <h6>Sort by:</h6>
                    <Button.Group>
                        <Button compact >Date</Button>
                        <Button.Or />
                        <Button compact color="blue">Relevance</Button>
                    </Button.Group>
                </div>
                <Divider/>
                <div>
                    <h6>Distance:  <Dropdown inline defaultValue="1" options={distanceOptions}/> {' '}</h6>
                </div>
                <Divider/>
                <div>
                    <h6>Salary estimate: </h6>
                    <List className="salary-list">
                        <List.Item as="a">$40,000  <span> (536)</span></List.Item>
                        <List.Item as="a">$60,000  <span> (1048)</span></List.Item>
                        <List.Item as="a">$80,000  <span> (2836)</span></List.Item>
                        <List.Item as="a">$100,000  <span> (990)</span></List.Item>
                        <List.Item as="a">$120,000+  <span> (521)</span></List.Item>
                    </List>
                </div>
                <Divider/>
                <div>
                    <h6>Job Type:</h6>
                    <List className="salary-list">
                        <List.Item as="a">Full-time  <span> (7793)</span></List.Item>
                        <List.Item as="a">Part-time  <span> (954)</span></List.Item>
                        <List.Item as="a">Internship  <span> (1539)</span></List.Item>
                        <List.Item as="a">Work from home  <span> (93)</span></List.Item>
                        <List.Item as="a">Contract  <span> (462)</span></List.Item>
                        <p className="expand-more"><Icon inline name="plus circle" color='blue'/> More >></p>
                    </List>
                </div>
                <Divider/>
                <div>
                    <h6>Company:</h6>
                    <List className="salary-list">
                        <List.Item as="a">SecureKey  <span> (25)</span></List.Item>
                        <List.Item as="a">Google  <span> (256)</span></List.Item>
                        <List.Item as="a">Microsoft  <span> (132)</span></List.Item>
                        <List.Item as="a">Work from home  <span> (93)</span></List.Item>
                        <List.Item as="a">Amazon  <span> (213)</span></List.Item>
                        <p className="expand-more"><Icon inline name="plus circle" color='blue'/> More >></p>
                    </List>
                </div>
            </Col>
            <Col id="board" xs={12} md={9}>
                <Segment>
                    <h2>Explore</h2>
                    <Item.Group divided>
                        <Item>
                            <Item.Image src={Amazon} size="tiny"/>
                            <Item.Content>
                                <Item.Header as="a">Full stack engineer</Item.Header>
                                <Item.Meta>Amazon <Rating size="mini" className="ml-1" defaultRating={4} maxRating={5} disabled/> </Item.Meta>
                                <Item.Description>Toronto, CA</Item.Description>
                                <Item.Extra>
                                    <Label color="green">New</Label>
                                    <Label><Icon name="briefcase"/>Full-time</Label>
                                    <Label><Icon name="clock outline"/>Posted 2 days ago</Label>
                                    <Button compact floated="right" color="blue">Apply now</Button>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                        <Item>
                            <Item.Image src={Securekey} size="tiny"/>
                            <Item.Content>
                                <Item.Header as="a">Software Developer</Item.Header>
                                <Item.Meta>Securekey Inc. <Rating size="mini" className="ml-1" defaultRating={5} maxRating={5} disabled/></Item.Meta>
                                <Item.Description>Toronto, CA</Item.Description>
                                <Item.Extra>
                                    <Label><Icon name="briefcase"/>Part-time</Label>
                                    <Label><Icon name="clock outline"/>Posted 7 days ago</Label>
                                    <Button compact floated="right" color="blue">Apply now</Button>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                        <Item>
                            <Item.Image src={Wish} size="tiny"/>
                            <Item.Content>
                                <Item.Header as="a">Data Scientist</Item.Header>
                                <Item.Meta>Wish <Rating size="mini" className="ml-1" defaultRating={3} maxRating={5} disabled/></Item.Meta>
                                <Item.Description>San Francisco, US</Item.Description>
                                <Item.Extra>
                                    <Label color="green">New</Label>
                                    <Label><Icon name="briefcase"/>Full-time</Label>
                                    <Label><Icon name="clock outline"/>Posted 4 days ago</Label>
                                    <Button compact floated="right" color="blue">Apply now</Button>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                        <Item>
                            <Item.Image src={Snap} size="tiny"/>
                            <Item.Content>
                                <Item.Header as="a">Software Engineer, Backend</Item.Header>
                                <Item.Meta>Snap Inc. <Rating size="mini" className="ml-1" defaultRating={4} maxRating={5} disabled/></Item.Meta>
                                <Item.Description>San Francisco, US</Item.Description>
                                <Item.Extra>
                                    <Label color="green">New</Label>
                                    <Label><Icon name="briefcase"/>Full-time</Label>
                                    <Label><Icon name="clock outline"/>Posted 1 week ago</Label>
                                    <Button compact floated="right" color="blue">Apply now</Button>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
                <Menu pagination floated="right">
                    <Menu.Item name="1"/>
                    <Menu.Item name="2"/>
                    <Menu.Item disabled>...</Menu.Item>
                    <Menu.Item name="50"/>
                    <Menu.Item name="51"/>
                    <Menu.Item name="52"/>

                </Menu>
            </Col>
        </Row>
    )
}

export default JobBoardDisplay