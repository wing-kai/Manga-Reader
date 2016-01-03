import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import { ipcRenderer } from 'electron'

import indexContextType from './index_context_type'

const { Component } = React

class ImportManage extends Component {
    
    constructor(props) {
        super(props);
        this.state = {}
    }
    
    render() {
        
        return (
            <div className="container import-manage-add">
                <button className="import-new-manga" onClick={this.handleClickUploadBtn.bind(this)}>
                    添加<br/>新漫画
                </button>
            </div>
        )

        return (
            <div className="container">
                <div className="import-manage-edit">
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap">
                        <button className="delete"></button>
                    </div>
                    <div className="new-manga-wrap continue-add" onClick={this.handleClickUploadBtn.bind(this)}>
                        继续添加
                    </div>
                    <div className="new-manga-wrap empty"></div>
                    <div className="new-manga-wrap empty"></div>
                    <div className="new-manga-wrap empty"></div>
                    <div className="new-manga-wrap empty"></div>
                    <div className="new-manga-wrap empty"></div>
                </div>
            </div>
        )
    }
    
    componentDidMount() {
        console.log(ipcRenderer);
        this.context.hideSideBar();
    }
    
    componentWillUnmount() {}
    
    handleClickUploadBtn() {
        ipcRenderer.once('show-directory-selector-reply', this.handleSelectedDirectory.bind(this));
        ipcRenderer.send('show-directory-selector');
    }
    
    handleSelectedDirectory(event, selectedDirectories) {
        console.log(selectedDirectories);
    }
}

ImportManage.contextTypes = Object.assign({}, indexContextType)

export default ImportManage