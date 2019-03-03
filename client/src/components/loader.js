import React from 'react';

import reader from '../reader.png';

export default (props) => {
    let style = {
        width: props.size + "px",
        height: props.size + "px",
    }

    return (
        <img src={reader} className="App__logo" alt="logo" style={style} />
    );
}