import LastReadManager, { LastReadInfo } from './LastReadManager';

/** Used by fetch requests */
global.jsonHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

/** Store sites list and manipulate it client-side */
export default class Storage {
    static siteFields = ["title", "url", "_id"];
    static key = 'sites';

    constructor(updateParentCallback) {
        this.storage = window.localStorage;
        // A callback to notify parent it needs to redraw
        this.updateParentCallback = updateParentCallback;
        this.sites = [];
        this.lastReadManager = null; // Will be filled on load
    }

    /** Part of sync process */
    storeLocally() {
        this.storage.setItem(Storage.key, JSON.stringify(this.sites));
    }

    /**
     * Compares two lists of sites
     *
     * @param {[Object]} listA
     * @param {[Object]} listB
     * @returns Boolean
     */
    siteCompare(listA, listB) {
        function cmp(a, b) {
            for (let field of Storage.siteFields) {
                if (a[field] !== b[field]) return false;
            }

            return true;
        }
        // Quick compare
        if (listA.length !== listB.length) return false;
        // Compare by members
        for (let i = 0; i < listA.length; i++) {
            if (cmp(listA[i], listB[i]) === false) {
                return false;
            }
        }
        return true; // Couldn't find discrepancies
    }


    /** Loads all sites from local, or contacts remote server */
    load() {
        let sites = this.storage.getItem(Storage.key);
        if (typeof (sites) === "string") {
            this.sites = JSON.parse(sites);
            console.log("Parsed sites from local data, updating parent.");
            this.updateParentCallback(this.sites);
        }
        // On either case, ask for fresh data from server
        this.loadFromServer();
    }

    /** Gets response from server, and fills/overwrites local if not the same. Separate function to make it easier to test */
    loadFromServer() {
        // Test express
        return fetch(Storage.key).then((res) => res.json()).then((res) => {
            if (this.siteCompare(res.sites, this.sites) === false) {
                console.log("Updating sites from server.");
                this.sites = res.sites;
                this.storeLocally();
                // Need to be initialized before the parent callback is called
                this.lastReadManager = new LastReadManager(this.sites, this.lastReadUpdate.bind(this));
                this.updateParentCallback(this.sites);
            } else {
                console.log("Server data matches local. Not touching.");
                this.lastReadManager = new LastReadManager(this.sites, this.lastReadUpdate.bind(this));
            }
        }).catch((err) => {
            throw new Error(err.message);
        })
    }


    /**
     * In case of remote error
     */
    rollback(lastSites) {
        this.sites = lastSites;
        this.storeLocally();
        this.updateParentCallback(this.sites);
    }

    verifyUrlNotExists(url, ownId) {
        console.info(`verifying ${url} and ${ownId}`)
        let found = this.sites.find(site => site.url === url && site._id !== ownId);
        if (found) return false;
        return true;
    }

    /**
     * Updates/creates a single site
     *
     * @param {String} siteId
     * @param {Object} site with title and url
     */
    save(siteId, site) {
        return new Promise((resolve, reject) => {
            // Verify that url does not exist
            if (!this.verifyUrlNotExists(site.url, siteId)) {
                throw new Error("Sorry, this url exists already. Try another.");
            }
            // Update local first
            // console.log("Updating local copy");
            let lastSites = Object.assign(this.sites); // Keep copy in case of server error
            let tempId;
            if (siteId) {
                this.update(siteId, site)
            } else {
                tempId = this.create(site);
            }
            // Now update the server
            // console.log("Updating server");
            let opts = {
                headers: global.jsonHeaders,
                method: siteId ? "PUT" : "POST",
                body: JSON.stringify({ site })
            };
            let url = siteId ? "/sites/" + siteId : "/sites";

            fetch(url, opts)
            .then((res) => res.json())
            .then((json) => {
                if (!json.success) {
                    throw new Error(json.error);
                }
                // console.log(`Updated server, json.id ${json.id} tempId ${tempId}`);
                if (json.id && tempId) {
                    this.updateTempId(tempId, json.id);
                }

                resolve(siteId ? siteId : json.id);
            }).catch((err) => {
                console.log(err);
                this.rollback(lastSites);
                reject(err);
            })
        })
    }

    /**
     * Updates local sites array
     *
     * @param {*} id
     * @param {*} site
     */
    update(id, site) {
        let pos = this.sites.findIndex((site) => site._id === id);
        let old = this.sites[pos];
        // If url was changed, we need to create a new lastRead object
        if (site.url !== old.url) {
            old.lastRead = new LastReadInfo();
        }
        // Update
        old._id = id;
        old.title = site.title;
        old.url = site.url;
        // Store and notify UI
        this.storeLocally();
        this.updateParentCallback(this.sites);
    }

    /**
     * Adds new site to local array and creates a random id to identify it
     *
     * @param {Object} site
     */
    create(site) {
        let _id = "tempId_" + Date.now();
        this.sites.push({
            _id,
            ...site,
            lastRead: new LastReadInfo(),
        });
        this.storeLocally();
        this.updateParentCallback(this.sites);
        return _id;
    }

    /**
     * Call this after create
     * @param {String} tempId
     * @param {String} remoteId
     */
    updateTempId(tempId, remoteId) {
        let pos = this.sites.findIndex((site) => site._id === tempId);
        if (pos) {
            this.sites[pos]._id = remoteId;
            this.storeLocally();
            this.updateParentCallback(this.sites);
            // console.log(`Updated tempID ${tempId} to ${remoteId}`);
        }
    }

    remove(siteId) {
        let lastSites = Object.assign(this.sites); // Keep copy in case of server error
        let pos = this.sites.findIndex((site) => site._id === siteId);
        this.sites.splice(pos, 1);
        this.storeLocally();
        // console.log("Updating parent");
        this.updateParentCallback(this.sites);
        // Now update the server
        // console.log("Updating server");
        let opts = {
            headers: global.jsonHeaders,
            method: "DELETE"
        };

        fetch(`/sites/${siteId}`, opts).then((res) => res.json()).then((json) => {
            if (!json.success) {
                throw new Error(json.error);
            }
            console.log("Storage:remove updated server");
        }).catch((err) => {
            console.log(err);
            this.rollback(lastSites);
        })
    }

    updateLastRead(url, data) {
        if (this.lastReadManager.updateLastRead(url, data) === true) { // Count was updated, and so we need a refresh
            this.storeLocally();
            this.updateParentCallback(this.sites);
        }
    }

    /**
     * A notification from child to parent to notify of data change that requires storing and UI refresh
     */
    lastReadUpdate() {
        this.storeLocally(); // Store in session/local-storage.
        this.updateParentCallback(this.sites); // Update the UI
    }

    storeSiteData(name, remoteData) {
        window.sessionStorage['rssReader-sitedata-' + name] = JSON.stringify(remoteData);
    }

    getSiteData(name) {
        const key = 'rssReader-sitedata-' + name;
        if (window.sessionStorage[key]) {
            return JSON.parse(window.sessionStorage[key]);
        }
    }

    clearSiteData(name) {
        const key = 'rssReader-sitedata-' + name;
        if (window.sessionStorage[key]) {
            delete(window.sessionStorage[key]);
        }
    }
}
