import React, { Component } from 'react';

import Chat from './Chat';
import Chat2 from './Chat2';
import Chat3 from './Chat3';

import logo from './logo.svg';
import './App.css';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
       <div>
        <br></br>
        <h1>Chat1</h1>
         <Chat />
         <br></br>
         <h1>Chat2</h1>
         <Chat2 />
         <br></br>
         <h1>Chat3</h1>
         <Chat3 />
       </div>
      </div>
    );
  }
}

export default App;
