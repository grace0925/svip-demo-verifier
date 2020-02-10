import React, {useState} from 'react'

import {useHistory} from 'react-router-dom'

import {ProgressBar} from "react-bootstrap";

function LoadProgress(props) {
    const [progress,setProgress] = useState(0)
    console.log("hey ")
    let history = useHistory();
    let type = props.type;
    let bar;
    let i = 0;

    if (type === "success") {
        bar = <ProgressBar striped variant="success" animated now={100}/>
    } else {
        bar = <ProgressBar striped animated now={100}/>
    }

    setInterval(function() {
        setTimeout(function() {
            history.push("/vcReady")
        }.bind(this), 4000)
        if (i === 101) {
            clearInterval(this);
        } else {
            setProgress(i)
            i++;
            console.log("current", progress)
        }
    }.bind(this), 20)

    return(
        <div>
            {bar}
        </div>
    )
}

export default LoadProgress