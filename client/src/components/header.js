import React from 'react';

export default (props) => {
    return (<header className="App-header">
        <h1 className="App-title">
            {props.title}
            <img src={props.logo} className="App-logo" alt="logo" />
        </h1>
    </header>);
}