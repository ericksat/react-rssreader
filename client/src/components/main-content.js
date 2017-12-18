import React from 'react';

import RssItem from './rss-item';
import Loader from './loader';

export default class MainContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            loading: false,
            error: null
        }
        this.limit = 80; // Character limit for fetched items
    }

    componentWillMount() {
        console.log("Mounting main content");
        this.fetchRss(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selected === this.props.selected) {
            // console.log("Nextprops equals current content props.");
            return;
        }
        // console.log("Updating main content", nextProps.selected, this.props.selected);
        this.fetchRss(nextProps);
    }

    fetchRss(props) {
        if (!props.selected) return;
        // Fetch
        this.setState({ data: null, loading: true, error: null });
        let url = "/rss/" + props.selected;
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
        let classes = this.props.show ? ["main-panel"] : ["main-panel hidden"];
        let rssMain = this.state.data ? (
        <div className="main-rss">
            <div className="main-rss__header">
                {this.state.data.image && <img className="main-rss__header__image" src={this.state.data.image} alt="Icon" /> }
                <h1 className="main-rss__header__title">{this.state.data.title}</h1>
            </div>
            <h2 className="main-rss__description">{this.state.data.description}</h2>
            {this.renderItems()}
        </div>) : undefined;

        return (
            <div className={classes}>
                {this.state.error && (<div className="main-panel__error">Error: {this.state.error}</div>) }
                {this.state.loading && <Loader size="120" />}
                { rssMain }
            </div>
        );
    }

}