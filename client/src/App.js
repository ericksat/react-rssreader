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

        this.currentWindowWidth = null;
        this.viewModeSwitch = 640; // At what pixel-width do we switch to 2 panels
        this.viewModeMobile = null; // Will be set on componentDidMount
        /** Ugly hack to prevent reloading of content when going back in mobile when menu is on (yes, it's that specific!) */
        this.ignorePopState = false;

        this.state = {
            sites: [],
            selectedSite: null,
            selectedSiteTitle: null,
            selectedSiteId: null,
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

    selectSite(id, pushToHistory = true, clearFromStorage = true) {
        // console.log("Selecting site " + id);
        let site = this.state.sites.find((site) => site._id === id);
        if (clearFromStorage) {
            this.storage.clearSiteData(site.url);
        }

        let stateUpdate = {
            selectedSite: site.url,
            selectedSiteTitle: site.title,
            editorOpen: false,
            editorSite: null,
            forceRefresh: false,
            selectedSiteId: site._id,
        };
        if (this.state.selectedSite === site.url && !this.state.editorOpen) { // Ask our main content nicely to refresh
            stateUpdate.forceRefresh = true;
        }

        stateUpdate.sideBarOn = !this.viewModeMobile;
        // console.log(`INNERWIDTH = ${window.outerWidth}, LIMIT = ${this.viewModeSwitch}, RESULT = ${stateUpdate.sideBarOn}`)
        // console.log("Received final id", id)
        this.setState(stateUpdate)

        if (pushToHistory) {
            window.history.pushState({ siteId: id }, "DOKOO - " + site.title, "/" + site.title);
            window.title = "Shmoofel - " + site.title;
        }
    }

    deleteSite(id) {
        // console.log("Deleting " + id);
        this.storage.remove(id);
    }

    /** Used by storage to lead to a redraw */
    storageUpdatedSites(sites) {
        console.log("App:updateSites called");
        this.setState({ sites, forceRefresh: false }, () => {
            if (window.location.pathname !== "/") {
                let title = decodeURIComponent(window.location.pathname.substr(1));
                // console.log("Title = " + title);
                // console.log(this.state.sites);
                let site = this.state.sites.find((site) => site.title === title);
                if (site && site._id !== this.state.selectedSiteId) {
                    this.selectSite(site._id, false);
                }
            }
        });
    }

    fetchSites() {
        this.closeEditor();
    }

    openAddSite() {
        this.setState({
            editorOpen: true,
            editorSite: null,
            selectedSite: null,
            sideBarOn: !this.viewModeMobile,
        })

    }

    openEditSite(id) {
        // Find the site
        let site = this.state.sites.find((site) => site._id === id);
        this.setState({
            editorOpen: true,
            editorSite: site,
            selectedSite: null,
            error: "",
            sideBarOn: !this.viewModeMobile,
        })
    }

    componentDidMount() {
        // console.log("Mounted app, width");
        // window.sessionStorage.clear(); // Give us a fresh start while we're testing.
        this.storage.load();
        global.storage = this.storage; // For debugging
        window.app = this;

        this.checkWidth();
        window.setInterval(() => this.checkWidth(), 500);

        window.onpopstate = (e) => {
            if (this.ignorePopState) {
                this.ignorePopState = false;
                return;
            }

            if (this.viewModeMobile && this.state.sideBarOn) {
                this.ignorePopState = true;
                window.history.forward();
                this.setState({sideBarOn: false});
            } else {
                if (e.state && e.state.siteId) {
                    this.selectSite(e.state.siteId, false, false);
                } else { // Unselect everything
                    this.closeEditor();
                }
            }
        }
    }

    checkWidth() {
        if (this.currentWindowWidth === window.outerWidth) return;
        // console.log("Width changed");
        this.currentWindowWidth = window.outerWidth;

        let currentViewMode = this.viewModeMobile;
        this.viewModeMobile = window.outerWidth < this.viewModeSwitch;
        if (currentViewMode === null) { // Initialize the sidebar for the first time
            if (this.viewModeMobile) {
                this.setState({ sideBarOn: false })
            } else {
                this.setState({ sideBarOn: true })
            }
        }
        else if (!this.viewModeMobile && this.viewModeMobile !== currentViewMode && this.state.sideBarOn === false) {
             this.setState( { sideBarOn: true })
        }
    }

    closeEditor() {
        this.setState({ editorOpen: false,
            editorSite: null,
            selectedSite: null,
            sideBarOn: true, // Keep it on no matter what view mode we're in
        });
    }

    /** Updates or inserts site */
    saveSite(id, site) {
        try {
            this.setState({ error: "" })
            this.storage.save(id, site).then((storedId) => {
                // console.log(`App:SaveSite ID ${storedId}`);
                this.closeEditor();
                this.selectSite(storedId);
            });
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
        this.storage.storeSiteData(url, channel);
    }

    toggleSidebar() {
        let newState = !this.state.sideBarOn;
        this.setState({sideBarOn: newState});
    }

    render() {
        return (
            <div className="App">
                <Header title="Shmoofel's RSS Reader&trade;" onMenu={this.toggleSidebar.bind(this)} />
                <SideBar sites={this.state.sites} show={this.state.sideBarOn} selected={this.state.selectedSiteId}
                selectSite={this.selectSite} deleteSite={this.deleteSite} editSite={this.openEditSite} onAddSite={this.openAddSite} />
                <Editor show={this.state.editorOpen} sideBarOn={this.state.sideBarOn} error={this.state.error} editorSite={this.state.editorSite} refreshParent={this.fetchSites} onCancel={this.closeEditor} saveSite={this.saveSite} />
                <MainContent sideBarOn={this.state.sideBarOn} show={!this.state.editorOpen} selected={this.state.selectedSite} storage={this.storage}
                            selectedTitle={this.state.selectedSiteTitle} onRssFetched={this.rssFetched} forceRefresh={this.state.forceRefresh} />
                <Footer content="RSS Reader&trade; &copy;2019 By Shmoofel Media, Powered by React and Node.js" />
            </div>
        );
    }
}

export default App;
