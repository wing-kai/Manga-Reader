import React from 'react'
import { Link } from 'react-router'

let Header = React.createClass({
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
});

export default Header