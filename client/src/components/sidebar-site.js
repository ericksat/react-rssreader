import React from 'react';

const SideBarSite = (props) => {
    let classy = props.active ? "sitelist__item sitelist__item--active" : "sitelist__item";
    let count = props.site.lastRead && props.site.lastRead.unreadItems > 0 ? `${props.site.lastRead.unreadItems}` : "";

    return (
        <div className={classy}>
            <span className="sitelist__item__title" data-role="select" data-id={props.site._id}>
                {props.site.title}
                {count ? (
                    <span className="pill">{count}</span>
                ) : (
                        <span className="hidden">{count}</span>
                )}
            </span>
            <button className="btn sitelist__item__edit" title="Edit" data-role="edit" data-id={props.site._id}>
                <i className="far fa-edit"></i>
            </button>
            <button className="btn sitelist__item__delete" title="Delete" data-role="delete" data-id={props.site._id}>
                <i className="far fa-trash-alt"></i>
            </button>
        </div>
    );
}

export default SideBarSite;