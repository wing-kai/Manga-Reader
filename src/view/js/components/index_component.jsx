import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'

const { Component } = React

class Home extends Component {
    render() {
        return (
            <div>
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
                <div className="main-content">
                    <nav className='navigation'>
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
                    <div className="container">
                        <div className="book-list">
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap" href='javascript:;'></a>
                            <a className="manga-wrap empty"></a>
                            <a className="manga-wrap empty"></a>
                            <a className="manga-wrap empty"></a>
                            <a className="manga-wrap empty"></a>
                            <a className="manga-wrap empty"></a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Home