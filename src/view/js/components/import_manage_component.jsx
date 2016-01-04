import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import { ipcRenderer } from 'electron'
import EasyFlux from '../lib/flux/index'

import indexContextType from './index_context_type'
import getAction from './import_manage_action'
import getStore from './import_manage_store'

const { Component } = React

const Flux = new EasyFlux({ dev: true })
const Action = getAction(Flux)
const Store = getStore(Flux)

class ImportManage extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            importing: false
        }
    }
    
    render() {

        const thisState = this.state;

        return (
            <div className="container import-manage-add">
                {
                    thisState.importing ? (
                        <button className="import-new-manga" disabled={true}>
                            导入中
                        </button>
                    ) : (
                        <button className="import-new-manga" onClick={this.handleClickUploadBtn.bind(this)}>
                            添加<br/>新漫画
                        </button>
                    )
                }
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
        this.context.hideSideBar();
        this.storeListener = Store.listen({
            getMangaInfo: this.handleMangaInfo.bind(this)
        });
    }
    
    componentWillUnmount() {
        Store.listenOff(this.storeListener);
    }
    
    handleClickUploadBtn() {
        ipcRenderer.once('show-directory-selector-reply', this.handleSelectedDirectory.bind(this));
        ipcRenderer.send('show-directory-selector');
    }
    
    handleSelectedDirectory(event, selectedDirectories) {
        this.setState({
            importing: true
        }, () => {
            Action.getMangaInfo(selectedDirectories);
        });
    }
    
    handleMangaInfo(str) {
        this.setState({
            importing: false
        })
    }
}

ImportManage.contextTypes = Object.assign({}, indexContextType)

export default ImportManage