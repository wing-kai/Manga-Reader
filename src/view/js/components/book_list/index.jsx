const React = require('react');
const Link = require('react-router').Link;
const MainContext = require('../context').MainContext;

let BookList = React.createClass({
    contextTypes: Object.assign({}, MainContext),
    render() {
        return (
            <div className="container">
                <div className="book-list">
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <Link to="/reader" className="manga-wrap"></Link>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                </div>
            </div>
        )
    },
    
    componentDidMount() {
        this.context.showSideBar();
    }
});

module.exports = BookList