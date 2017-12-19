import React from 'react';

const SideBarSite = (props) => {
    let classy = props.active ? "sitelist__item sitelist__item--active" : "sitelist__item";

    return (
        <div className={classy}>
            <span className="sitelist__item__title" data-role="select" data-id={props.site._id}>{props.site.title}</span>
            <button className="btn sitelist__item__edit" title="Edit" data-role="edit" data-id={props.site._id}>&#x1f6e0;</button>
            <button className="btn sitelist__item__delete" title="Delete" data-role="delete" data-id={props.site._id}>&#x2716;</button>
        </div>
    );
}

export default SideBarSite;