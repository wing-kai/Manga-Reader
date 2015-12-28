import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import indexContextType from './index_context_type'

const { Component } = React

class Reader extends Component {
    render() {
        console.log('Reader', this.context)
        return (
            <div className="container">
                hello, world
                <br/>
                <Link to="/">back to home</Link>
                <br/>
                <a href="javascript:;" onClick={this.context.toggleSidebar}>toggleSideBar</a>
            </div>
        )
    }
}

Reader.contextTypes = indexContextType;

export default Reader