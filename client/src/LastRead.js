import {Base64} from 'js-base64';

/**
 * Sub-component of storage, that will handle last read items
 */
export default class LastRead {
    constructor(storage, updateParentCb) {
        this.storage = storage;
        this.list = [];
        this.sync = this.sync.bind(this);
        this.updateParentCallback = updateParentCb;
        this.timer = setTimeout(this.sync, LastRead.syncInterval); // Compare sites every now and then
    }

    load(sites) {
        let lastItems = this.storage.getItem(LastRead.key);
        if (typeof (lastItems) === "string") {
            this.list = JSON.parse(lastItems);
            console.log(`Parsed ${this.list.length} lastReadItems from sessionStorage.`);
        }
        if (!this.list || this.list.length === 0) {
            this.list = [];
            sites.forEach((site) => {
                // let encodedKey = Base64.encode(site.url);
                console.log(`URL ${site.url}`); // encoded as ${encodedKey}`);
                // Make sure it's unique
                if (!this.list.find((stored) => site.url === stored.url)) {
                    this.list.push({
                        url: site.url,
                        lastReceivedItem: 0, // This is the latest timestamp received from server, will become lastReadItem on click
                        lastReadItem: 0, // This is the latest timestamp the user actually 'read' by clicking
                        lastCheck: Date.now(),
                        lastCount: 0
                    });
                } else {
                    console.log(`Found existing ${site.url}`);
                }
            });
            this.store();
        }
    }

    store() {
        console.log("Storing last items");
        this.storage.setItem(LastRead.key, JSON.stringify(this.list));
    }

    selectNextSite() {
        return this.list.reduce((prev, site) => {
            if (prev === undefined) return site;
            return site.lastCheck < prev.lastCheck ? site : prev;
        }, undefined);
    }

    /**
     * Performs request to server and checks if there are new entries. Not a sync with the storage object
     */
    sync() {
        // Pull a site from the queue
        if (!this.list.length) {
            console.log("List is empty effendy.");
            return;
        }
        let candidate = this.selectNextSite();
        let now = Date.now();
        // A bit of throttling
        if ((now - candidate.lastCheck) / 1000 < LastRead.minCheckTime) {
            console.log("Minimum time didn't pass yet, waiting...");
            // Queue the next sync test and return
            setTimeout(this.sync, LastRead.syncInterval);
            return;
        }
        // Prod server, on success we check if there are new items
        let url = new URL(`${window.location.origin}/rss-items/${encodeURIComponent(Base64.encode(candidate.url))}`);
        url.searchParams.append("lastRead", candidate.lastReadItem);
        // console.log("Sent request: " + url.toString());
        fetch(url).then((res) => res.json()).then((json) => {
            // console.log(json);
            if (!json.success) {
                throw new Error(json.error);
            }
            candidate.lastCheck = now;
            // Notice the second comparison - it should prevent an update in case user clicked on a site AFTER the request was sent to server
            if (json.count > 0 && json.latest.tstamp > candidate.lastReadItem) {
                console.log(`Response for last item ${candidate.url} has count ${json.count}`);
                candidate.lastReceivedItem = json.latest.tstamp; // If user clicks on the site, this will be used for future comparisons
                if (json.count !== candidate.lastCount) { // Trigger re-render if count has changed
                    console.log(`${json.count} !== ${candidate.lastCount}`);
                    candidate.lastCount = json.count;
                    this.updateParentCallback(candidate.url, json.count);
                    this.store();
                }
            }
            // Queue the next sync test
            setTimeout(this.sync, LastRead.syncInterval);
        }).catch((err) => {
            console.log(err);
        })
    }

    /**
     * Updates url to know that it was visited right now
     *
     * @param {String} url
     */
    touch(url) {
        // Find entry
        let entry = this.list.find((item) => item.url === url);
        if (!entry) throw new Error("Could not locate url " + url);
        entry.lastReadItem = entry.lastReceivedItem; // So next syncs will test from after the latest received item
        entry.lastCheck = Date.now();
        if (entry.lastCount !== 0) {
            entry.lastCount = 0;
            this.store();
        }
    }

    /**
     * Refreshes url list post edit/delete/update on the Storage object.
     * Does not edit existing entries - deletes if no more references, adds if there are new
     *
     * @param {[Object]} sites
     */
    compareAndRefresh(sites) {
        // First delete any missing links
        // for (let entry of this.list) {
        //     for (let )
        // }
        // Then add new entries
        for (let site of sites) {
            let found = false;
            for (let entry of this.list) {
                if (site.url === entry.url) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                // TODO: This should be in a function, because it's used twice.
                this.list.push({
                    url: site.url,
                    lastReceivedItem: 0, // This is the latest timestamp received from server, will become lastReadItem on click
                    lastReadItem: 0, // This is the latest timestamp the user actually 'read' by clicking
                    lastCheck: Date.now(),
                    lastCount: 0
                })
            }
        }
    }
}

LastRead.key = "lastItemsRead";
LastRead.minCheckTime = 60; // A minute for now, will increase later
LastRead.syncInterval = 6000;
