/** Store sites list and manipulate it client-side */
export default class Storage {
    constructor(updateParentCallback) {
        this.storage = window.sessionStorage; // Will update to localStorage when it's ready
        // A callback to notify parent it needs to redraw
        this.updateParentCallback = updateParentCallback;
        this.sites = [];
        // Do we need periodical sync? I think only on page load
        // this.timer = setInterval(this.sync.bind(this), 15000); // Compare sites every now and then
    }

    /** Part of sync process */
    store() {
        this.storage.setItem('sites', JSON.stringify(this.sites));
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

    /** Syncs with server */
    sync() {
        // Test express
        // TODO: Handle errors
        fetch("/sites").then((res) => res.json()).then((res) => {
            if (this.siteCompare(res.sites, this.sites) === false) {
                this.sites = res.sites;
                this.store();
                this.updateParentCallback(this.sites);
            }
        })
    }

    /** Loads all sites from local, or contacts remote server */
    load() {
        let sites = this.storage.getItem("sites");
        if (typeof (sites) === "string") {
            this.sites = JSON.parse(sites);
            this.updateParentCallback(this.sites);
        }
        // On either case, ask for fresh data from server
        this.sync();
    }

    /**
     * In case of remote error
     */
    rollback(lastSites) {
        this.sites = lastSites;
        this.store();
        this.updateParentCallback(this.sites);
    }

    /**
     * Updates/creates a single site
     *
     * @param {String} siteId
     * @param {Object} site with title and url
     */
    save(siteId, site) {
        // Update local first
        console.log("Updating local copy");
        let lastSites = Object.assign(this.sites); // Keep copy in case of server error
        let tempId;
        if (siteId) {
            this.update(siteId, site)
        } else {
            tempId = this.create(site);
        }
        // Now update the server
        console.log("Updating server");
        let opts = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: siteId ? "PUT" : "POST",
            body: JSON.stringify({ site })
        };
        let url = siteId ? "/sites/" + siteId : "/sites";

        fetch(url, opts).then((res) => res.json()).then((json) => {
            if (!json.success) {
                throw new Error(json.error);
            }
            console.log(`Updated server, json.id ${json.id} tempId ${tempId}`);
            if (json.id && tempId) {
                this.updateTempId(tempId, json.id);
            }
        }).catch((err) => {
            console.log(err);
            this.rollback(lastSites);
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
        this.sites[pos] = {
            _id: id,
            ...site
        };
        this.store();
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
            ...site
        });
        this.store();
        this.updateParentCallback(this.sites);
        return _id;
    }

    /**
     * Call this after create
     * @param {String} tempId
     * @param {String} remoteId
     */
    updateTempId(tempId, remoteId) {
        console.log("Calling update temp Id");
        let pos = this.sites.findIndex((site) => site._id === tempId);
        console.log("Found pos " + pos);
        if (pos) {
            this.sites[pos]._id = remoteId;
            this.store();
            this.updateParentCallback(this.sites);
        }
    }

    remove(siteId) {
        let lastSites = Object.assign(this.sites); // Keep copy in case of server error
        let pos = this.sites.findIndex((site) => site._id === siteId);
        this.sites.splice(pos, 1);
        this.store();
        console.log("Updating parent");
        this.updateParentCallback(this.sites);
        // Now update the server
        console.log("Updating server");
        let opts = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "DELETE"
        };

        fetch(`/sites/${siteId}`, opts).then((res) => res.json()).then((json) => {
            if (!json.success) {
                throw new Error(json.error);
            }
            console.log("Updated server");
        }).catch((err) => {
            console.log(err);
            this.rollback(lastSites);
        })
    }
}

Storage.siteFields = ["title", "url", "_id"];