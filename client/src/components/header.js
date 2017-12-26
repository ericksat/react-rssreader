import React from 'react';

import Loader from './loader';

const Header = (props) => {
    return (<header className="App__header">
        <h1 className="App__title">
            {props.title}
            <Loader size="32" />
        </h1>
    </header>);
}

export default Header;