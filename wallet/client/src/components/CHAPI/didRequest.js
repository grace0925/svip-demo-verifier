import React from 'react'

import {Container, Button} from 'react-bootstrap'

class DidRequest extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    async componentDidMount() {
        window.addEventListener('message', event => {
            console.log(event)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
    }

    render() {
        return(
            <Container>
                <Button className="pt-5 mt-5">Testing did request</Button>
            </Container>
        )
    }
}

export default DidRequest