import {Base64} from 'js-base64';

export class LastReadInfo {
    constructor(obj) {
        if (!obj) {
            this.readTstamp = 0; // Latest item read timestamp
            this.recentCheck = 0; // For throttling, later on
            this.unreadItems = 0; // How many unread items
        }
        else {
            this.readTstamp = obj.readTstamp;
            this.recentCheck = obj.recentCheck;
            this.unreadItems = obj.unreadItems;
        }
    }

    /**
     * Updates internal values and resets count to 0 if necessary
     *
     * @returns Boolean true if count was changed (and you should refersh UI,) false if not.
     */
    touch(tstamp) {
        this.readTstamp = tstamp;
        this.recentCheck = Date.now();
        if (this.unreadItems !== 0) {
            this.unreadItems = 0;
            return true;
        } // else
        return false; // Default is to not redraw the ui
    }

    /**
     * Follows a sync from the server with a new count value
     *
     * @param {Object} latestItem
     * @param {Number} count
     * @returns Boolean true if count was updated, and the UI needs a refresh
     */
    updateCount(latestItem, count) {
        this.recentCheck = Date.now();
        // Notice the second comparison - it should prevent an update in case user clicked on a site AFTER the request was sent to server
        if (count > 0 && latestItem.tstamp > this.readTstamp) {
            // console.log(`Response for last item ${candidate.url} has count ${json.count}`);
            if (count !== this.unreadItems) { // Trigger re-render if count has changed
                // console.log(`${count} !== ${this.unreadItems}`);
                this.unreadItems = count;
                return true; // ui needs to be redrawn
            }
        }

        return false; // Default is to not redraw the ui
    }
}

/**
 * Sub-component of storage, that will handle last read items
 */
export default class LastReadManager {
    constructor(sites, updateParentCallback) {
        this.key = "lastItemsRead";
        this.minCheckTime = 120000; // A pause between new item pollings
        this.syncInterval = 2000; // When we start polling, check each site separately, with a small interval (counted AFTER response is received)

        this.sites = sites;
        this.sites.forEach(element => { // Initialize each lastReadInfo structure
            element.lastRead = new LastReadInfo(element.lastRead); // Restoring from session ruins the class, so we need to re-instantiate
        });

        this.sync = this.sync.bind(this);
        this.updateParentCallback = updateParentCallback;
        this.timer = setTimeout(this.sync, this.syncInterval); // Compare sites every now and then
    }

    selectNextSite() {
        if (!this.sites.length) return null;

        return this.sites.reduce((prev, site) => {
            if (prev === undefined) return site;
            return site.lastRead.recentCheck < prev.lastRead.recentCheck ? site : prev;
        }, undefined);
    }

    /**
     *
     * @param {*} url
     * @param {*} data
     * @returns Boolean true if count was updated and UI needs a refresh
     */
    updateLastRead(url, data) {
        // Find entry
        let entry = this.sites.find((item) => item.url === url);
        if (!entry) throw new Error(`Could not locate url ${url}`);
        // Fetch most recent item's timestamp
        let latestTstamp = data.items[0].tstamp;

        return entry.lastRead.touch(latestTstamp);
    }

    /**
     * Performs request to server and checks if there are new entries. Not a sync with the storage object
     */
    sync() {
        // Pull a site from the queue
        let candidate = this.selectNextSite();
        if (!candidate) return;
        let recentCheck = candidate.lastRead.recentCheck;
        // A bit of throttling
        if ( Date.now() - recentCheck  < this.minCheckTime) {
            // console.log("Minimum time didn't pass yet, waiting...");
            // Queue the next sync test and return
            setTimeout(this.sync, this.syncInterval);
            return;
        }
        // Prod server, on success we check if there are new items
        let url = new URL(`${window.location.origin}/rss-items/${encodeURIComponent(Base64.encode(candidate.url))}`);
        url.searchParams.append("lastRead", candidate.lastRead.readTstamp);
        // console.log("Sent request: " + url.toString());
        fetch(url).then((res) => res.json()).then((json) => {
            // console.log(json);
            if (!json.success) {
                throw new Error(json.error);
            }
            let redrawNeeded = candidate.lastRead.updateCount(json.latest, json.count);
            if (redrawNeeded) {
                this.updateParentCallback();
            }
            // Queue the next sync test
            setTimeout(this.sync, this.syncInterval);
        }).catch((err) => {
            console.log(err);
        })
    }

}
