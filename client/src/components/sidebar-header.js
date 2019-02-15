import React from 'react';

const SideBarHeader = (props) => {
    return (
        <div className="sidebar__header">
            <h2 className="sidebar__header__title">Site List
            <button className="btn btn-primary sidebar__header__add" onClick={props.add} title="Add Site">
                <i className="fas fa-plus"></i>
            </button>
            </h2>
        </div>
    );
};

export default SideBarHeader;