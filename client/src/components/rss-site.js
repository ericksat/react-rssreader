import React from 'react';

export default (props) => {
    return (
        <div>
            <h3 onClick={props.selectSite} data-url={props.site.url}>{props.site.title}</h3>
        </div>
    );
}