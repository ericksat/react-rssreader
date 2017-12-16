import React from 'react';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: "",
            title: "",
            url: ""
        }
    }

    componentWillMount() {
        this.fillState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        // Compare editor site
        if ( (nextProps.editorSite === null && this.props.id !== "") ||
                nextProps.editorSite._id !== this.props.id ) {
            this.fillState(nextProps);
        }
    }

    fillState(props) {
        if (props.editorSite != null) {
            this.setState({
                title: props.editorSite.title,
                url: props.editorSite.url,
                id: props.editorSite._id
            });
        } else {
            this.setState({
                title: "",
                id: "",
                url: ""
            })
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let site = {
            title: this.state.title.trim(),
            url: this.state.url.trim(),
        }
        if (site.title.length > 0 && site.url.length > 0) {
            this.saveSite(this.state.id, site);
        }
    }

    /** Updates or inserts site */
    saveSite(id, site) {
        let opts = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: id ? "PUT" : "POST",
            body: JSON.stringify({ site })
        };
        let url = id ? "/sites/" + id : "/sites";

        fetch(url, opts).then((res) => res.json()).then((json) => {
            if (json.success) {
                this.props.refreshParent();
            }
        })
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return (
            <div className="editor">
                <h1>Editor</h1>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <input type="text" name="title" placeholder="Title" value={this.state.title} onChange={this.handleChange.bind(this)} />
                    <input type="text" name="url" placeholder="URL" value={this.state.url} onChange={this.handleChange.bind(this)} />
                    <button type="submit" className="btn btn-primary">Submit</button>
                    <button type="button" className="btn btn-secondary" onClick={this.props.onCancel}>Cancel</button>
                </form>
            </div>
        );
    }
}