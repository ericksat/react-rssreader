import React from 'react';

export default (props) => {
    return (
        <div className="sitelist__item">
            <span className="sitelist__item__title" data-role="select" data-id={props.site._id}>{props.site.title}</span>
            <button className="btn" data-role="edit" data-id={props.site._id}>Edit</button>
            <button className="btn" data-role="delete" data-id={props.site._id}>Del</button>
        </div>
    );
}