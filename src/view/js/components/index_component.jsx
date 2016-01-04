import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import EasyFlux from '../lib/flux/index'
import indexContextType from './index_context_type'
import getAction from './index_action'
import getStore from './index_store'

const { Component } = React

const Flux = new EasyFlux()
const Action = getAction(Flux)
const Store = getStore(Flux)

class Sidebar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }

    render() {
        return (
            <nav className='navigation' style={{display: this.state.show ? 'flex' : 'none'}}>
                <div className='title'>分类</div>
                <ul>
                    <li className="selected">分类</li>
                    <li>分类</li>
                    <li>分类</li>
                    <li>分类</li>
                    <li>分类</li>
                </ul>
                <footer>
                    <Link className='btn' to="/import">新增</Link>
                    <button className='btn'>设置</button>
                </footer>
            </nav>
        )
    }
    
    componentDidMount() {
        this.storeListeners = Store.listen({
            showSideBar: this.handleToggleSidebar.bind(this),
            hideSideBar: this.handleToggleSidebar.bind(this)
        });
    }
    
    componentWillUnmount() {
         Store.listenOff(this.storeListeners);
    }
    
    handleToggleSidebar(show = false) {
        this.setState({ show });
    }
}

class Header extends Component {
    render() {
        return (
            <header>
                <button>
                    <Link to='/'>所有漫画</Link>    
                    <span className='line'></span>
                </button>
                <button>
                    <Link to='/'>分类</Link>
                    <span className='line'></span>
                </button>
                <button>
                    <Link to='/'>其它</Link>
                    <span className='line'></span>
                </button>
            </header>
        )
    }
}

class Main extends Component {

    getChildContext() {
        return {
            showSideBar: Action.showSideBar,
            hideSideBar: Action.hideSideBar
        }
    }
    
    render() {
        return (
            <div className="home">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    {this.props.children}
                </div>
            </div>
        )
    }
}

Main.childContextTypes = indexContextType

export default Main