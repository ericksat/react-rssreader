import React from 'react';

// import Loader from './loader';

export default class Header extends React.Component {
    render() {
        return (<header className="App__header">
            <button className="settings-btn" onClick={this.props.onMenu} aria-label="Toggle Site-List sidebar">
                <i className="fas fa-bars"></i>
            </button>
            <h1 className="App__title">
                {this.props.title}
                {/* <Loader size="32" /> */}
            </h1>
        </header>);
    }
}