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
import './css/App.css';
import './css/Bar.css';
import './css/MainPanel.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sites: [],
            selectedSite: null,
            editorOpen: false,
            editorSite: null,
            forceRefresh: false,
            error: "",
            sideBarOn: false,
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
        let leNew = { selectedSite: site.url, editorOpen: false, editorSite: null, forceRefresh: false };
        if (this.state.selectedSite === site.url && !this.state.editorOpen) { // Ask our main content nicely to refresh
            leNew.forceRefresh = true;
        }

        leNew.sideBarOn = window.innerWidth >= 576;
        // console.log("Received final id", id)
        this.setState(leNew)
    }

    deleteSite(id) {
        console.log("Deleting " + id);
        this.storage.remove(id);
    }

    /** Used by storage to lead to a redraw */
    storageUpdatedSites(sites) {
        console.log("App:updateSites called");
        this.setState({ sites, forceRefresh: false });
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
        // window.sessionStorage.clear(); // Give us a fresh start while we're testing.
        this.storage.load();
        global.storage = this.storage; // For debugging
        window.app = this;

        if (window.innerWidth >= 576) {
            this.setState( {sideBarOn: true})
        } else {
            this.setState({ sideBarOn: false })
        }
    }

    closeEditor() {
        this.setState({ editorOpen: false, editorSite: null, selectedSite: null });
    }

    /** Updates or inserts site */
    saveSite(id, site) {
        // console.log(`App:SaveSite ID ${id}`);
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

    toggleSidebar() {
        let newState = !this.state.sideBarOn;
        this.setState({sideBarOn: newState});
    }

    render() {
        return (
            <div className="App">
                <Header title="Shmoofel's RSS Reader&trade;" onMenu={this.toggleSidebar.bind(this)} />
                <SideBar sites={this.state.sites} show={this.state.sideBarOn}
                selectSite={this.selectSite} deleteSite={this.deleteSite} editSite={this.openEditSite} onAddSite={this.openAddSite} />
                <Editor show={this.state.editorOpen} error={this.state.error} editorSite={this.state.editorSite} refreshParent={this.fetchSites} onCancel={this.closeEditor} saveSite={this.saveSite} />
                <MainContent sideBarOn={this.state.sideBarOn} show={!this.state.editorOpen} selected={this.state.selectedSite} onRssFetched={this.rssFetched} forceRefresh={this.state.forceRefresh} />
                <Footer content="RSS Reader&trade; &copy;2019 By Shmoofel Media, Powered by React and Node.js" />
            </div>
        );
    }
}

export default App;
