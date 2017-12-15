import React from 'react';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edited: null,
            title: "",
            url: ""
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let form = e.target;
        let site = {
            title: form.title.value.trim(),
            url: form.url.value.trim()
        }
        if (site.title.length > 0 && site.url.length > 0) {
            this.addSite(site);
        }
    }

    addSite(site) {
        let opts = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ site, test: "1", "fucku": true })
        };

        fetch("/sites", opts).then((res) => res.json()).then((json) => {
            if (json.success) {
                this.setState({
                    title: "",
                    url: ""
                })
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