import React from 'react';

import RssItem from './rss-item';
import Loader from './loader';

export default class MainContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            loading: false
        }
        this.limit = 80; // Character limit for fetched items
    }

    componentWillUpdate(nextProps) {
        if (nextProps.selected === this.props.selected) return;
        // console.log("Updating main content", nextProps.selected, this.props.selected);
        if (nextProps.selected) { // Fetch
            this.setState({ data: null, loading: true });
            let url = "/rss/" + nextProps.selected;
            // console.log("Will fetch", url);
            fetch(url).then((res) => res.json()).then((json) => {
            // console.log(json);
                this.setState({
                    loading: false,
                    data: {
                        title: json.title[0],
                        description: json.description[0],
                        image: json.image ? json.image[0] : undefined,
                        items: json.items
                    }
                });
            })
        }
    }

    renderItems() {
        if (!this.state.data.items) return;
        return (this.state.data.items.map((item, index) => {
            return <RssItem key={index} item={item} limit={this.limit} />
        }));
    }

    renderRss() {
        return (
        <div className="rss-container">
            <h1>{this.state.data.title}</h1>
            <h2>{this.state.data.description}</h2>
            {this.renderItems()}
        </div>
        );
    }

    render() {
        return (
            <div className="main-panel">
                {this.state.loading && <Loader size="120" />}
                { this.state.data ? this.renderRss() : undefined }
            </div>
        );
    }

}