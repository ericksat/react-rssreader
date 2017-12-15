import React from 'react';

export default (props) => {
    return (
        <div className="sidebar__header">
                <h2 className="sidebar__header__title">Site List</h2>
                <button className="btn btn-primary sidebar__header__add" onClick={props.add}>Add Site</button>
        </div>
    );
}