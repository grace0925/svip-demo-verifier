import React from 'react'

import axios from 'axios'
import {Button} from 'react-bootstrap'

class CredentialRequest extends React.Component {
    constructor(props) {
        super(props);
        this.setState({

        })
    }

    async confirm() {
        try {
            let res = await axios.get("https://localhost:8081/getVC")
            console.log(res.data)
        } catch(e) {
            console.log(e)
        }
        window.parent.postMessage(
            {
                type: "response",
                credential: {
                    dataType: "VerifiableProfile",
                    data: null,
                }
            },
            window.location.origin
        );
    }

    componentDidMount() {
        window.addEventListener('message', event => {
            this.setState({
                vc: event.data.credential.data,
            })
            console.log(this.state.vc)
        });
        (async () => {
            window.parent.postMessage({type: 'request',}, window.location.origin);
            console.log("loaded credential store UI")
        })();
    }
    render() {
        return (
            <div>
                <Button className="mt-5" onClick={this.confirm}>Test</Button>
            </div>
        )
    }
}

export default CredentialRequest