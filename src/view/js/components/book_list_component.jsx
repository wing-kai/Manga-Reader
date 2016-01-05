import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'

import indexContextType from './index_context_type'

const { Component } = React

class BookList extends Component {
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
    }
    
    componentDidMount() {
        this.context.showSideBar();
    }
}

BookList.contextTypes = Object.assign({}, indexContextType);

export default BookList