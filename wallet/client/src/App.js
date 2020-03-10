import React from 'react';
import './App.css';

import Routes from './routes'
import Header from './components/header'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className="App">
                <Header />
                <Routes />
            </div>
        );
    }
}

export default App;
