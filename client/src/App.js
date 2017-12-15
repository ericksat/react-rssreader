import React, { Component } from 'react';

import Footer from './components/footer';
import Header from './components/header';
import SideBar from './components/sidebar';
import MainContent from './components/main-content';
import Editor from './components/editor';

import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sites: [],
            selectedSite: null,
            editorOpen: false,
            editorId: null
        }
    }

    selectSite(id) {
        // console.log("Received final url", url)
        this.setState({selectedSite: id, editorOpen: false})
    }

    deleteSite(id) {
        console.log("Deleting " + id);
        let opts = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "DELETE",
        };

        fetch("/sites/" + id, opts).then((res) => res.json()).then((json) => {
            if (json.success) {
                this.fetchSites();
            }
        });
    }

    fetchSites() {
        // Test express
        fetch("/sites").then((res) => res.json()).then((res) => {
            // TODO: Handle error
            this.setState({
                sites: res.sites
            });
        })
    }

    openAddSite() {
        this.setState({
            editorOpen: true,
            editorId: null
        })
    }

    componentDidMount() {
        console.log("Mounting app");
        this.fetchSites();
    }

    closeEditor() {
        this.setState({ editorOpen: false });
    }

  render() {
    return (
      <div className="App">
        <Header title="Welcome to RSS Reader&trade;" />
        <div className="content content--main">
            <SideBar sites={this.state.sites} selectSite={this.selectSite.bind(this)} deleteSite={this.deleteSite.bind(this)} onAddSite={this.openAddSite.bind(this)} />
            { this.state.editorOpen ?  // So ugly
                <Editor editorId={this.state.editorId} refreshParent={this.fetchSites.bind(this)} onCancel={this.closeEditor.bind(this)} /> :
                <MainContent selected={this.state.selectedSite} />
            }
        </div>
        <Footer content="RSS Reader&trade; &copy;2017 By Shmoofel Media" />
      </div>
    );
  }
}

export default App;
