import React, { Component } from 'react';
import logo from './logo.svg';

import Footer from './components/footer';
import Header from './components/header';
import SideBar from './components/sidebar';
import MainContent from './components/main-content';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header title="Welcome to RSS Reader&trade;" logo={logo} />
        <div className="content content--main">
            <SideBar />
            <MainContent />
        </div>
        <Footer content="RSS Reader&trade; &copy;2017 By Shmoofel Media" />
      </div>
    );
  }
}

export default App;
