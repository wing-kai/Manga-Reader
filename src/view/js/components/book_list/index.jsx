import React from 'react'
import { Link } from 'react-router'
import { MainContext } from '../context'

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

export default BookList