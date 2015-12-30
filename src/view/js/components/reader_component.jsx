import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import indexContextType from './index_context_type'
import { VIEW_MODE } from './reader_constants.js'

const { Component } = React;

class PageContainer extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            viewMode: VIEW_MODE.SINGLE,
            imgALoaded: false,
            imgBLoaded: false,
            imgAStyle: {},
            imgBStyle: {}
        }
    }

    render() {

        const thisState = this.state;
        let wrapClass = "";
        let wrapContent;
        
        switch (thisState.viewMode) {
            case VIEW_MODE.SINGLE:
                wrapContent = (
                    <div className="wrap default" ref='wrap'>
                        <img src="../img/example_tabloid.png" alt="example_tabloid" />
                    </div>
                )
                break;
            case VIEW_MODE.DOUBLE:
                wrapContent = (
                    <div className="wrap double" ref='wrap'>
                        <img style={this.state.imgAStyle} ref='imgA' onLoad={this.handleImageLoaded.bind(this, "A")} src="../img/example_tabloid.png" alt="example_tabloid" />
                        <img style={this.state.imgBStyle} ref='imgB' onLoad={this.handleImageLoaded.bind(this, "B")} src="../img/example_b5.png" alt="example_b5" />
                    </div>
                )
                break;
        }

        return (
            <div className="page-container">
                {wrapContent}
                {this.props.children}
            </div>
        )
    }
    
    componentWillUpdate() {
        if (this.state.viewMode !== VIEW_MODE.DOUBLE)
            window.removeEventListener('resize', this.handleScaleImage);
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleScaleImage);
    }
    
    handleImageLoaded(order) {

        let that = this;
        let thisState = this.state;

        let setState = new Promise(resolve => {
            let newState = {};

            if (order === 'A')
                newState.imgALoaded = true;
            else
                newState.imgBLoaded = true;

            that.setState(newState, resolve);
        });

        setState.then(function() {
            if (thisState.imgALoaded === thisState.imgBLoaded === true) {
                that.handleScaleImage.bind(that)();
                window.addEventListener('resize', that.handleScaleImage.bind(that));
            }
        });
    }
    
    handleScaleImage() {

        const thisRefs = this.refs;
        const { wrap, imgA, imgB } = thisRefs;

        let newImgAStyle = {};
        let newImgBStyle = {};
        
        newImgBStyle.height = imgA.height;
        newImgBStyle.width  = imgA.height * imgB.width / imgB.height;
        
        const z = (imgA.width + newImgBStyle.width) / wrap.clientWidth;
        const getNewLength = (len) => +(len/z).toFixed(0);
        
        newImgAStyle = {
            width:  getNewLength(imgA.width),
            height: getNewLength(imgA.height)
        }
        
        newImgBStyle = {
            width:  getNewLength(newImgBStyle.width),
            height: getNewLength(newImgBStyle.height)
        }

        this.setState({
            imgAStyle: newImgAStyle,
            imgBStyle: newImgBStyle
        });
    }
}

class ControlBar extends Component {
    render() {
        return (
            <div className='control-bar'>
                <Link to="/" className='btn'>退出</Link>
                <button className='btn'>阅读</button>
                <button className='btn turn left'>上一页</button>
                <input type="text" defaultValue="13" />
                <button className='btn turn right'>下一页</button>
                <button className='btn'>书签</button>
                <button className='btn'>模式</button>
            </div>
        )
    }
}

class Reader extends Component {
    render() {
        return (
            <PageContainer>
                <ControlBar />
            </PageContainer>
        )
    }
}

Reader.contextTypes = Object.assign({}, indexContextType);

export default Reader