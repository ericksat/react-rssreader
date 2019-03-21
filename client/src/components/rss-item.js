import React from 'react';
import moment from 'moment';

function replaceSomeEntities(src) {
    var mapObj = {
        "&#8217;": "\u2019",
        "&#8216;": "\u2018",
        "&#039;": "\u0027",
        "&#160;": " ",
    };
    return src.replace(/&#8217;|&#8216;|&#039;|&#160;/g, function (matched) {
        // let dookoo = matched.substr(2, matched.length - 3);
        // console.log(dookoo);
        // let hex = parseInt(dookoo).toString(16);
        // if (hex.length < 4) {
        //     hex = hex.padStart(4, '0');
        // }

        // console.log(matched);
        // console.log(mapObj[matched]);

        return mapObj[matched];
    });
}

export default (props) => {
    let description = props.item.description.length > props.limit ? props.item.description.substr(0, props.limit) + "..." : props.item.description;
    description = replaceSomeEntities(description);
    const title = replaceSomeEntities(props.item.title);

    return (
        <div className="rss__item">
            <a className="rss__item__link" href={props.item.link} target="_blank" rel="noopener noreferrer">{title}</a>
            <p className="rss__item__time">{moment(props.item.pubDate).format("dddd, MMMM Do, YYYY h:mmA")}</p>
            <p className="rss__item__description">{description}</p>
        </div>
    );
}