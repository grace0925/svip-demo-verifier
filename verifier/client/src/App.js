import React, {useState} from 'react';
import './App.css';

// ---------- Components ----------
import Header from './components/header'
import Routes from './routes'
// --------------------------------

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            image: "",
            name: "",
        }
        this.handleImg = this.handleImg.bind(this);
    }
    handleImg = (img) => {
        this.setState({image: img})
    }
    handleName = (name) => {
        this.setState({name: name})
    }

    render() {
        const {image, name} = this.state
        return (
            <div className="App">
                <Header encodeImage={image} name={name}/>
                <Routes onimgEncode={this.handleImg} onName={this.handleName}/>
            </div>
        );
    }
}

export default App;
