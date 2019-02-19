import React from 'react';

// import logo from '../logo.svg';
import reader from '../reader.png';

export default (props) => {
    let style = {
        width: props.size + "px",
        height: props.size + "px",
        marginTop: "2rem",
    }

    return (
        <img src={reader} className="App__logo" alt="logo" style={style} />
    );
}