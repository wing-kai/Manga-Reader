import React from 'react'
import { Link } from 'react-router'

let SideBar = React.createClass({
    getDefaultProps() {
        return {
            visible: true
        }
    },
    render() {

        return (
            <nav className='navigation' style={{display: this.props.visible ? 'flex' : 'none'}}>
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
});

export default SideBar