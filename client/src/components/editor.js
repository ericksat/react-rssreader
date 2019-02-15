import React from "react";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: "",
            title: "",
            url: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
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
            });
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let site = {
            title: this.state.title.trim(),
            url: this.state.url.trim(),
        };
        if (site.title.length > 0 && site.url.length > 0) {
            this.props.saveSite(this.state.id, site);
        }
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        let classes = this.props.show ? ["editor"] : ["editor hidden"];

        return (
            <div className={classes}>
                <h1 className="editor__title">RSS Site Info</h1>
                { this.props.error && <div className='error'>{this.props.error}</div> }
                <form onSubmit={this.onSubmit} className="editor__form">
                    <input type="text" name="title" placeholder="Title" value={this.state.title} onChange={this.handleChange} />
                    <input type="text" name="url" placeholder="URL" value={this.state.url} onChange={this.handleChange} />
                    <div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                        <button type="button" className="btn btn--secondary" onClick={this.props.onCancel}>Cancel</button>
                    </div>

                </form>
            </div>
        );
    }
}