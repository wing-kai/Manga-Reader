import React from 'react'
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router'
import { ipcRenderer } from 'electron'
import EasyFlux from 'easy-flux'

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
            importing: false,
            firstLoad: true
        }
    }
    
    render() {

        const thisState = this.state;

        if (thisState.firstLoad) {
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
        }
        
        const newMangaList = Store.getNewMangaList();
        const that = this;

        return (
            <div className="container">
                <div className="import-manage-edit">
                    {
                        newMangaList.map( ({ hash, cover, path, title }) => {
                            return (
                                <div className="new-manga-wrap" key={hash}>
                                    <img src={path + '/' + cover} alt={title} title={title} />
                                    <button className="delete" title='删除漫画' onClick={this.handleClickDeleteBtn.bind(that, hash)}></button>
                                </div>
                            )
                        })
                    }
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
            getMangaInfo: this.handleGetMangaInfo.bind(this),
            deleteManga: this.handleDeletedManga.bind(this)
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
        if (Array.isArray(selectedDirectories)) {
            this.setState({
                importing: true
            }, () => {
                Action.getMangaInfo(selectedDirectories);
            });
        }
    }

    handleGetMangaInfo(newMangaList = []) {

        let newState = {
            importing: false
        }

        if (newMangaList.length)
            newState.firstLoad = false;
        else
            alert('选择的目录里边没有看到漫画内容……');

        this.setState(newState);
    }
    
    handleClickDeleteBtn(hash) {
        Action.deleteManga(hash);
    }
    
    handleDeletedManga({ deletedManga, hasMore }) {
        this.setState({ firstLoad: !hasMore });
    }
}

ImportManage.contextTypes = Object.assign({}, indexContextType)

export default ImportManage