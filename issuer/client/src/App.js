import React, {Component} from 'react';
import './stylesheets/App.css';

// ---------- Components ----------
import Header from './components/header';
import Routes from './routes';
// --------------------------------

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ""
        };
        this.handleName = this.handleName.bind(this);
    }
    handleName(name) {
        this.setState({
            name: name
        })
    }
    render() {
        const {name} = this.state;
        return (
            <div className="App">
                <Header loggedInUser={name}/>
                <Routes onName={this.handleName}/>
            </div>
        )
    }
}

export default App;
