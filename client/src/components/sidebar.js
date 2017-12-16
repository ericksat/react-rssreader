import React from 'react';

import SideBarHeader from './sidebar-header';
import SideBarSite from './sidebar-site';

export default class SideBar extends React.Component {

    renderSiteList() {
        return this.props.sites.map((site) => {
            return <SideBarSite key={site._id} site={site} />
        });
    }

    onSiteListClick(e) {
        // See if it's a select event, or a delete one (or edit in the future)
        let type = e.target.getAttribute('data-role');
        let id = e.target.getAttribute('data-id');
        if (type === "select") {
            this.selectSite(id);
        } else if (type === "delete") {
            this.deleteSite(id);
        } else if (type === "edit") {
            this.editSite(id)
        }
    }

    selectSite(id) {
        // console.log("Selected url", url);
        this.props.selectSite(id);
    }

    deleteSite(id) {
        this.props.deleteSite(id);
    }

    editSite(id) {
        this.props.editSite(id);
    }

    onAddSite() {
        this.props.onAddSite();
    }

    render() {
        return (
            <div className="sidebar">
                <SideBarHeader add={this.onAddSite.bind(this)} />
                <div className="sidebar__sitelist" onClick={this.onSiteListClick.bind(this)}>
                    {this.renderSiteList()}
                </div>
            </div>
        );
    }

}