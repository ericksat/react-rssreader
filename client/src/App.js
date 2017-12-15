import React, { Component } from 'react';

import Footer from './components/footer';
import Header from './components/header';
import SideBar from './components/sidebar';
import MainContent from './components/main-content';

import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sites: [],
            selectedSite: null,
        }
    }

    selectSite(url) {
        // console.log("Received final url", url)
        this.setState({selectedSite: url})
    }

    componentDidMount() {
        console.log("Mounting app");
        // Test express
        fetch("/sites").then((res) => res.json()).then((res) => {
            // TODO: Handle error
            this.setState({
                sites: res.sites
            });
        })
    }

  render() {
    return (
      <div className="App">
        <Header title="Welcome to RSS Reader&trade;" />
        <div className="content content--main">
            <SideBar sites={this.state.sites} selectSite={this.selectSite.bind(this)} />
            <MainContent selected={this.state.selectedSite} />
        </div>
        <Footer content="RSS Reader&trade; &copy;2017 By Shmoofel Media" />
      </div>
    );
  }
}

export default App;
