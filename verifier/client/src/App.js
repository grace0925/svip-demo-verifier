import React from 'react';
import './App.css';

// ---------- Components ----------
import Header from './components/header'
import Routes from './routes'
// --------------------------------

function App() {
    return (
        <div className="App">
            <Header/>
            <Routes/>
        </div>
    );
}

export default App;
