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
            <nav className='navigation' style={{display: this.state.show ? 'block' : 'none'}}>
                <div className='title'>分类</div>
                <ul>
                    <li className="selected">分类</li>
                    <li>分类</li>
                    <li>分类</li>
                    <li>分类</li>
                    <li>分类</li>
                </ul>
                <footer>
                    <button>新增</button>
                    <button>设置</button>
                </footer>
            </nav>
        )
    }
    
    componentDidMount() {
        this.storeListeners = Store.listen({
            toggleSidebar: this.handleToggleSidebar.bind(this)
        });
    }
    
    handleToggleSidebar() {
        this.setState({
            show: !this.state.show
        })
    }
}

class Header extends Component {
    render() {
        return (
            <div className="header">
                <center>
                    <button>
                        所有漫画
                        <span className='line'></span>
                    </button>
                    <button>
                        分类
                        <span className='line'></span>
                    </button>
                    <button>
                        其它
                        <span className='line'></span>
                    </button>
                </center>
            </div>
        )
    }
}

class Main extends Component {
    
    getChildContext() {
        return {
            toggleSidebar: Action.toggleSidebar
        }
    }
    
    render() {
        return (
            <div>
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