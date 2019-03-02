import React from 'react';
import {Base64} from 'js-base64';

import RssItem from './rss-item';
import Loader from './loader';

export default class MainContent extends React.Component {
    constructor(props) {
        super(props);

        this.startY = null;
        this.boxo   = null;

        this.state = {
            data: null,
            loading: false,
            error: null
        }
        this.limit = 80; // Character limit for fetched items
    }

    componentWillMount() {
        // console.log("Mounting main content selected = " + this.props.selected);
        this.fetchRss(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selected === this.props.selected && !nextProps.forceRefresh) {
            // console.log("Nextprops equals current content props.");
            return;
        }
        // console.log("Updating main content", nextProps.selected, this.props.selected);
        this.fetchRss(nextProps);
    }

    initBoxo() {
        document.body.classList.remove('refreshing');

        this.boxo = document.querySelector('#main-rss');
        if (this.boxo == null) {
            return;
        }

        this.boxo.addEventListener('touchstart', e => {
            this.startY = e.touches[0].pageY;
        }, { passive: true });

        this.boxo.addEventListener('touchmove', e => {
            const y = e.touches[0].pageY;
            // Activate custom pull-to-refresh effects when at the top of the container
            // and user is scrolling up.
            if (document.scrollingElement.scrollTop === 0
                && y - this.startY > 200 &&
                !document.body.classList.contains('refreshing'))
            {
                // console.log("Refreshing");
                document.body.classList.add('refreshing');
                this.fetchRss(this.props);
            }
        }, { passive: true });
    }

    fetchRss(props) {
        if (!props.selected) return;
        // Fetch
        this.setState({ data: null, loading: true, error: null });
        let url = "/rss/" + Base64.encode(props.selected);
        // console.log("Will fetch", url);
        fetch(url).then((res) => res.json()).then((json) => {
            if (json.error) {
                throw new Error(json.error);
            }
            // console.log(json);
            this.setState({
                loading: false,
                data: json.channel
            });

            this.props.onRssFetched(props.selected, this.state.data);
            setTimeout(() => this.initBoxo(), 1000);
        }).catch((e) => {
            this.setState({
                error: e.message,
                loading: false,
                data: null
            });
        });
    }

    renderItems() {
        if (!this.state.data.items) return;
        return (this.state.data.items.map((item, index) => {
            return <RssItem key={index} item={item} limit={this.limit} />
        }));
    }

    render() {
        let classes = this.props.show ? "main-panel" : "main-panel hidden";
        if (this.props.show && this.props.sideBarOn) classes += " main-panel__with-sidebar";

        if (this.props.selected == null) {
            return (
                <div className={classes}>
                    <h1 className="main-panel__welcome">
                        To begin, please select a site from the sidebar.
                    </h1>
                </div>
            );
        }

        let rssMain = this.state.data ? (
            <div className="main-rss" id="main-rss">
                <div className="main-rss__header">
                    {this.state.data.image && <img className="main-rss__header__image" src={this.state.data.image} alt="Icon" /> }
                        <h1 className="main-rss__header__title" title={this.state.data.description}>{this.props.selectedTitle}</h1>
                </div>
                {/* <h2 className="main-rss__description">{this.state.data.description}</h2> */}
                {this.renderItems()}
            </div>) : undefined;

        return (
            <div className={classes}>
                {this.state.error && (<div className="main-panel__error">Error: {this.state.error}</div>) }
                {this.state.loading && <Loader size="64" />}
                { rssMain }
            </div>
        );
    }

}