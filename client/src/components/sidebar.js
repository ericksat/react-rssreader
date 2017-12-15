import React from 'react';

import SideBarHeader from './sidebar-header';
import RssSite from './rss-site';

export default class SideBar extends React.Component {

    renderSiteList() {
        return this.props.sites.map((site) => {
            return <RssSite key={site._id} site={site} selectSite={this.selectSite.bind(this)} />
        });
    }

    selectSite(e) {
        // Get url
        let url = e.target.getAttribute('data-url');
        // console.log("Selected url", url);
        this.props.selectSite(url);
    }

    render() {
        return (
            <div className="sidebar">
                <SideBarHeader />
                {this.renderSiteList()}
            </div>
        );
    }

}