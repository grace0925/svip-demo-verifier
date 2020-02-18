import React, {Component} from 'react';
import './stylesheets/App.css';

// ---------- Components ----------
import Header from './components/header';
import Routes from './routes';
// --------------------------------

class App extends Component {
    render() {
        return (
            <div className="App">
                <Header/>
                <Routes/>
            </div>
        )
    }
}

export default App;
