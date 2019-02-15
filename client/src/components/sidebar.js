import React from 'react';

import SideBarHeader from './sidebar-header';
import SideBarSite from './sidebar-site';

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: null
        };
    }

    renderSiteList() {
        function cmp(a, b) {
            return a.title.localeCompare(b.title);
        }
        // The concat creates a copy of the array
        return this.props.sites.concat().sort(cmp).map((site) => {
            return <SideBarSite key={site._id} site={site} active={this.state.selected === site._id} />
        });
    }

    onSiteListClick(e) {
        e.stopPropagation();
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
        this.props.selectSite(id);
        this.setState({selected: id});
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
        let classes = this.props.show ? ["sidebar"] : ["sidebar hidden"];
        return (
            <div className={classes}>
                <div className="sidebar_small" hidden>
                    This is the small sidebar
                </div>
                <div>
                    <SideBarHeader add={this.onAddSite.bind(this)} />
                    <div className="sidebar__sitelist" onClick={this.onSiteListClick.bind(this)}>
                        {this.renderSiteList()}
                    </div>
                </div>
            </div>
        );
    }

}