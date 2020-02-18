import React from 'react'
import * as polyfill from 'credential-handler-polyfill'
import {Container, Button, FormControl} from 'react-bootstrap'

class Verify extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            vc: {},
        };

        this.handleGet = this.handleGet.bind(this);
        // load CHAPI
        (async () => {
            await polyfill.loadOnce(
                `${process.env.REACT_APP_MEDIATOR_URL}/mediator?origin=` +
                + encodeURIComponent(window.location.origin));
        })();
    }

    async handleGet() {
        const credentialQuery = JSON.parse('{"web": {"VerifiablePresentation": {}}}');
        const result = await navigator.credentials.get(credentialQuery);
    }

    componentDidMount() {
        this.handleGet()
    }

    render() {
        return (
            <Container>
            </Container>
        )
    }
}

export default Verify