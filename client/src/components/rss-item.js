import React from 'react';
import moment from 'moment';

export default (props) => {
    let description = props.item.description.length > props.limit ? props.item.description.substr(0, props.limit) + "..." : props.item.description;
    return (
        <div className="rss__item">
            <a className="rss__item__link" href={props.item.link} target="_blank" rel="noopener noreferrer">{props.item.title}</a>
            <p className="rss__item__time">{moment(props.item.pubDate).format("dddd, MMMM Do, YYYY h:mmA")}</p>
            <p className="rss__item__description">{description}</p>
        </div>
    );
}