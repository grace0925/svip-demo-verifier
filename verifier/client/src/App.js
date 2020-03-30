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
        }
        this.handleImg = this.handleImg.bind(this);
        console.log("app constructing...")
    }
    handleImg = (img) => {
        console.log("app => ", img)
        this.setState({image: img})
    }
    componentWillMount() {
        console.log("app mounting")
        console.log("app mounting props => ")
        console.log(this.props)
    }

    render() {
        const {image} = this.state
        return (
            <div className="App">
                <Header encodeImage={image}/>
                <Routes onimgEncode={this.handleImg}/>
            </div>
        );
    }
}

export default App;
