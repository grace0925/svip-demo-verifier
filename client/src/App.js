import React, {Component} from 'react';
import IssueCred from './issueCred'
import Header from './header'
import './App.css';


class App extends Component {
    render() {
        return (
            <div className="App">
                <Header/>
                <IssueCred />
            </div>
        )
    }
}

export default App;
