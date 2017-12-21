import {Base64} from 'js-base64';

// TOOD: Find a better name for this

export class ReadStruct {
    constructor() {
        this.readTstamp = 0;
        this.recentCheck = Date.now();
        this.newItemCount = 0;
        this.prevCount = 0;
    }

    /**
     * Updates internal values and resets count to 0 if necessary
     *
     * @returns Boolean true if count was changed (and you should refersh UI,) false if not.
     */
    touch(tstamp) {
        this.readTstamp = tstamp;
        this.recentCheck = Date.now();
        if (this.newItemCount !== 0) {
            this.newItemCount = 0;
            return true;
        } // else
        return false; // Default is to not redraw the ui
    }

    /**
     * Follows a sync from the server with a new count value
     *
     * @param {*} tstamp
     * @param {*} count
     * @returns Boolean true if count was updated, and the UI needs a refresh
     */
    updateCount(tstamp, count) {
        this.recentCheck = Date.now();
        // Notice the second comparison - it should prevent an update in case user clicked on a site AFTER the request was sent to server
        if (count > 0 && tstamp > this.readTstamp) {
            // console.log(`Response for last item ${candidate.url} has count ${json.count}`);
            if (count !== this.newItemCount) { // Trigger re-render if count has changed
                console.log(`${count} !== ${this.newItemCount}`);
                this.newItemCount = count;
                return true; // ui needs to be redrawn
            }
        }

        return false; // Default is to not redraw the ui
    }
}

/**
 * Sub-component of storage, that will handle last read items
 */
export default class LastRead {
    constructor(sites, updateParentCallback) {
        this.sites = sites;
        this.sites.forEach(element => {
            if (!element.lastRead) {
                element.lastRead = new ReadStruct();
            }
        });

        this.sync = this.sync.bind(this);
        this.updateParentCallback = updateParentCallback;
        this.timer = setTimeout(this.sync, LastRead.syncInterval); // Compare sites every now and then
    }

    selectNextSite() {
        return this.sites.reduce((prev, site) => {
            if (prev === undefined) return site;
            return site.lastRead.recentCheck < prev.lastRead.recentCheck ? site : prev;
        }, undefined);
    }

    /**
     * Performs request to server and checks if there are new entries. Not a sync with the storage object
     */
    sync() {
        // Pull a site from the queue
        let candidate = this.selectNextSite();
        // let now = Date.now();
        // A bit of throttling
        // if ((now - candidate.lastCheck) / 1000 < LastRead.minCheckTime) {
        //     console.log("Minimum time didn't pass yet, waiting...");
        //     // Queue the next sync test and return
        //     setTimeout(this.sync, LastRead.syncInterval);
        //     return;
        // }
        // Prod server, on success we check if there are new items
        let url = new URL(`${window.location.origin}/rss-items/${encodeURIComponent(Base64.encode(candidate.url))}`);
        url.searchParams.append("lastRead", candidate.lastRead.readTstamp);
        // console.log("Sent request: " + url.toString());
        fetch(url).then((res) => res.json()).then((json) => {
            // console.log(json);
            if (!json.success) {
                throw new Error(json.error);
            }
            let redrawNeeded = candidate.lastRead.updateCount(json.latest.tstamp, json.count);
            if (redrawNeeded) {
                this.updateParentCallback();
            }
            // Queue the next sync test
            setTimeout(this.sync, LastRead.syncInterval);
        }).catch((err) => {
            console.log(err);
        })
    }

}

LastRead.key = "lastItemsRead";
LastRead.minCheckTime = 60; // A minute for now, will increase later
LastRead.syncInterval = 6000;
