import React from 'react';

export default (props) => {
    let description = props.item.description.length > props.limit ? props.item.description.substr(0, props.limit) + "..." : props.item.description;
    return (
        <div className="rss__item">
            <h3><a href={props.item.link} target="_blank">{props.item.title}</a></h3>
            <p>Posted at {props.item.pubDate}</p>
            <p>{description}</p>
        </div>
    );
}