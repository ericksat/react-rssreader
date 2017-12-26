import React from 'react';

import logo from '../logo.svg';

export default (props) => {
    let style = {
        width: props.size + "px",
        height: props.size + "px",
    }

    return (
        <img src={logo} className="App__logo" alt="logo" style={style} />
    );
}