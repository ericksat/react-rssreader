import React, { Component } from 'react';
// Storage class
import Storage from './Storage';
// Components
import Footer from './components/footer';
import Header from './components/header';
import SideBar from './components/sidebar';
import MainContent from './components/main-content';
import Editor from './components/editor';
// CSS
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sites: [],
            selectedSite: null,
            editorOpen: false,
            editorSite: null,
            error: ""
        }

        this.storage = new Storage(this.storageUpdatedSites.bind(this));
        // Do all the eventhandler bindings here
        this.selectSite = this.selectSite.bind(this);
        this.deleteSite = this.deleteSite.bind(this);
        this.openEditSite = this.openEditSite.bind(this);
        this.openAddSite = this.openAddSite.bind(this);
        this.fetchSites = this.fetchSites.bind(this);
        this.closeEditor = this.closeEditor.bind(this);
        this.saveSite = this.saveSite.bind(this);
        this.rssFetched = this.rssFetched.bind(this);
    }

    selectSite(id) {
        let site = this.state.sites.find((site) => site._id === id);
        // let site = this.storage.updateLastVisit(id);
        // console.log("Received final id", id)
        this.setState({ selectedSite: site.url, editorOpen: false, editorSite: null })
    }

    deleteSite(id) {
        console.log("Deleting " + id);
        this.storage.remove(id);
    }

    /** Used by storage to lead to a redraw */
    storageUpdatedSites(sites) {
        console.log("App:updateSites called");
        this.setState({ sites });
    }

    fetchSites() {
        this.closeEditor();
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
            selectedSite: null,
            error: ""
        })
    }

    componentDidMount() {
        console.log("Mounting app");
        // this.fetchSites();
        window.sessionStorage.clear(); // Give us a fresh start while we're testing.
        this.storage.load();
        global.storage = this.storage; // For debugging
    }

    closeEditor() {
        this.setState({ editorOpen: false, editorSite: null, selectedSite: null });
    }

    /** Updates or inserts site */
    saveSite(id, site) {
        console.log(`App:SaveSite ID ${id}`);
        try {
            this.setState({ error: "" })
            this.storage.save(id, site);
            this.closeEditor();
        } catch (e) {
            this.setState({ error: e.message });
        }
    }

    /**
     * Main Content fetched RSS data successfully.
     * @param {Object} channel
     */
    rssFetched(url, channel) {
        this.storage.updateLastRead(url, channel);
    }

    render() {
        return (
            <div className="App">
                <Header title="Welcome to RSS Reader&trade;" />
                <div className="content content--main">
                    <SideBar sites={this.state.sites} selectSite={this.selectSite} deleteSite={this.deleteSite} editSite={this.openEditSite} onAddSite={this.openAddSite} />
                    <Editor show={this.state.editorOpen} error={this.state.error} editorSite={this.state.editorSite} refreshParent={this.fetchSites} onCancel={this.closeEditor} saveSite={this.saveSite} />
                    <MainContent show={!this.state.editorOpen} selected={this.state.selectedSite} onRssFetched={this.rssFetched} />
                </div>
                <Footer content="RSS Reader&trade; &copy;2017 By Shmoofel Media, Powered by React and Node.js" />
            </div>
        );
    }
}

export default App;
