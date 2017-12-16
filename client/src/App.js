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
            editorSite: null
        }
    }

    selectSite(id) {
        // console.log("Received final id", id)
        this.setState({selectedSite: id, editorOpen: false, editorSite: null})
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
        this.closeEditor();
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
            editorSite: null,
            selectedSite: null
        })
    }

    openEditSite(id) {
        // Find the site
        let site = this.state.sites.find((site) => site._id === id);
        this.setState({
            editorOpen: true,
            editorSite: site,
            selectedSite: null
        })
    }

    componentDidMount() {
        console.log("Mounting app");
        this.fetchSites();
    }

    closeEditor() {
        this.setState({ editorOpen: false, editorSite: null, selectedSite: null });
    }

  render() {
    return (
      <div className="App">
        <Header title="Welcome to RSS Reader&trade;" />
        <div className="content content--main">
            <SideBar sites={this.state.sites} selectSite={this.selectSite.bind(this)} deleteSite={this.deleteSite.bind(this)}
                    editSite={this.openEditSite.bind(this)} onAddSite={this.openAddSite.bind(this)} />
            { this.state.editorOpen ?  // So ugly
                <Editor editorSite={this.state.editorSite} refreshParent={this.fetchSites.bind(this)} onCancel={this.closeEditor.bind(this)} /> :
                <MainContent selected={this.state.selectedSite} />
            }
        </div>
        <Footer content="RSS Reader&trade; &copy;2017 By Shmoofel Media" />
      </div>
    );
  }
}

export default App;
