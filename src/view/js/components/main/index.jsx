const React = require('react');
const ReactDOM = require('react-dom');
const EasyFlux = require('easy-flux' );
const { remote, ipcRenderer, webFrame } = require('electron');
const { Menu, MenuItem } = remote;

const getAction = require('./action');
const getStore = require('./store');

const RectangleSelection = require('../rectangle_selection');
const SideMenu = require('../side_menu');
const MangaManage = require('../../modules/manga_manage');

const Flux = new EasyFlux({ dev: true });
const Action = getAction(Flux);
const Store = getStore(Flux);

let stateCache;

const SIDE_BAR = {
    ALL: "SIDE_BAR_ALL",
    AUTHOR: "SIDE_BAR_AUTHOR",
    CATEGORIES: "SIDE_BAR_CATEGORIES",
    EXPORT: "SIDE_BAR_EXPORT",
    CONFIG: "SIDE_BAR_CONFIG"
}

// disable zoom
webFrame.setZoomLevelLimits(1, 1);

const BookCase = React.createClass({
    getDefaultProps() {
        return {
            list: [],
            category: "",
            author: "",
            draggable: false,
            rectangleSelected: new Set()
        }
    },

    render() {

        const that = this;
        const thisProps = this.props;
        const list = thisProps.list.map( manga => (
            <div
                className={"manga-wrap" + (thisProps.rectangleSelected.has(manga.get('hash')) ? " selected" : "")}
                key={manga.get("hash")}
                title={manga.get("title")}
                onContextMenu={this.handleRightClick.bind(that, manga)}
                data-hash={manga.get("hash")}
            >
                <img
                    onDragStart={this.handleDragStart}
                    draggable={thisProps.draggable}
                    src={manga.get("path") + '/' + manga.get("cover")}
                    alt={manga.get("title")}
                    onClick={this.handleClickMangaWrap.bind(that, manga.get("hash"))}
                    data-hash={manga.get("hash")}
                />
            </div>
        ));

        return (
            <div className="container">
                {
                    list.length ? (
                        <div className="book-list">
                            {list}
                            <div style={{ flex:1 }} />
                        </div>
                    ) : thisProps.category ? null : (
                        <div
                            style={{
                                flex:1,
                                display:'flex',
                                justifyContent:'center',
                                alignItems:'center',
                                flexDirection:'column',
                                color:'#eee'
                            }}
                        >
                            <div className="icon ico-emoji-neutral" style={{fontSize:30}} />
                            <br/>
                            <div>资料库什么都没有，添加一些漫画吧</div>
                            <br/>
                            <small onClick={thisProps.handleExport}><span className="icon ico-plus" />&nbsp;添加漫画</small>
                        </div>
                    )
                }
            </div>
        )
    },

    handleDragStart(event) {
        if (!this.props.draggable)
            return event.preventDefault();

        if (this.props.rectangleSelected.size)
            event.dataTransfer.setData("hash", Array.from(this.props.rectangleSelected));
        else
            event.dataTransfer.setData("hash", [event.target.dataset.hash]);
    },

    handleClickMangaWrap(hash) {
        this.props.readManga(hash);
    },

    handleRightClick(manga) {

        const menu = new Menu();
        const that = this;
        const thisProps = this.props;
        const categories = MangaManage.getCategory();

        // menu.append(new MenuItem({
        //     label: '详细信息'
        // }));
        if (categories.length) {
            menu.append(new MenuItem({
                label: '添加到分类',
                submenu: MangaManage.getCategory().filter(
                    category => category.id !== thisProps.category
                ).map(
                    category => ({
                        label: category.name,
                        click() {
                            if (thisProps.rectangleSelected.size) {
                                return Array.from(thisProps.rectangleSelected).map(
                                    hash => MangaManage.getManga(hash)
                                ).forEach(
                                    mangaObj => mangaObj.setCategory(category.id)
                                );
                            }

                            manga.setCategory(category.id);
                        }
                    })
                )
            }));
        }
        if (thisProps.category) {
            menu.append(new MenuItem({
                label: '从分类中移除',
                click() {
                    if (thisProps.rectangleSelected.size) {
                        Array.from(thisProps.rectangleSelected).map(
                            hash => MangaManage.getManga(hash)
                        ).forEach(
                            mangaObj => mangaObj.removeFromCategory(thisProps.category)
                        );
                    } else {
                        manga.removeFromCategory(thisProps.category);
                    }

                    thisProps.parentForceUpdate();
                }
            }));
        }
        menu.append(new MenuItem({
            type: 'separator'
        }));
        menu.append(new MenuItem({
            label: '删除',
            click() {
                if (thisProps.rectangleSelected.size) {
                    Array.from(thisProps.rectangleSelected).map(
                        hash => MangaManage.getManga(hash)
                    ).forEach( mangaObj => mangaObj.remove() );
                } else {
                    manga.remove();
                }

                MangaManage.saveConfig().then(thisProps.parentForceUpdate);
            }
        }));

        menu.popup(remote.getCurrentWindow());
    }
});

const getMainComponent = stateCache => React.createClass({

    getInitialState() {

        if (stateCache) {
            stateCache.rectangleSelected = new Set();
        }

        return stateCache ? stateCache : {
            sideBar: SIDE_BAR.ALL,
            categories: MangaManage.getCategory(),
            authors: [],
            selectedCategory: 0,
            selectedAuthor: 0,
            rectangleSelected: new Set()
        }
    },

    render() {
        const thisState = this.state;
        let BookCaseContent;

        if (
            thisState.sideBar === SIDE_BAR.ALL
            || (thisState.sideBar === SIDE_BAR.CATEGORIES && thisState.selectedCategory === 0)
            || (thisState.sideBar === SIDE_BAR.AUTHOR && thisState.selectedAuthor === 0)
        ) {
            BookCaseContent = (
                <BookCase
                    rectangleSelected={thisState.rectangleSelected}
                    readManga={this.handleSelectedManga}
                    parentForceUpdate={this.handleForceUpdate}
                    draggable={thisState.sideBar === SIDE_BAR.CATEGORIES}
                    list={MangaManage.getMangaListCopy()}
                    handleExport={this.handleClickExportBtn}
                />
            )
        } else if (thisState.sideBar === SIDE_BAR.CATEGORIES) {
            BookCaseContent = (
                <BookCase
                    rectangleSelected={thisState.rectangleSelected}
                    readManga={this.handleSelectedManga}
                    parentForceUpdate={this.handleForceUpdate}
                    draggable={true}
                    list={MangaManage.getCategory(thisState.selectedCategory)}
                    category={thisState.selectedCategory}
                />
            )
        } else { // thisState.sideBar === SIDE_BAR.AUTHOR

        }

        return (
            <div className="home">
                <div className="header"></div>
                <div className="container">
                    <div className="sidebar">
                        <button
                            className={"icon ico-box" + (thisState.sideBar === SIDE_BAR.ALL ? " active" : "")}
                            onClick={this.handleClickSidebarBtn.bind(this, SIDE_BAR.ALL)}
                            title="资料库"
                        />
                        <button
                            className={"icon ico-users" + (thisState.sideBar === SIDE_BAR.AUTHOR ? " active" : "")}
                            onClick={this.handleClickSidebarBtn.bind(this, SIDE_BAR.AUTHOR)}
                            disabled={true}
                            style={{display:'none'}}
                            title="按作者查看"
                        />
                        <button
                            className={"icon ico-list" + (thisState.sideBar === SIDE_BAR.CATEGORIES ? " active" : "")}
                            onClick={this.handleClickSidebarBtn.bind(this, SIDE_BAR.CATEGORIES)}
                            title="按分类查看"
                        />
                        <div style={{flex:1}}></div>
                        <button
                            className={"icon ico-plus" + (thisState.sideBar === SIDE_BAR.EXPORT ? " active" : "")}
                            onClick={this.handleClickExportBtn}
                            title="导入漫画"
                        />
                        <button
                            className={"icon ico-cog" + (thisState.sideBar === SIDE_BAR.CONFIG ? " active" : "")}
                            onClick={this.handleClickSidebarBtn.bind(this, SIDE_BAR.CONFIG)}
                            disabled={true}
                            style={{display:'none'}}
                            title="设置"
                        />
                    </div>
                    {
                        thisState.sideBar === SIDE_BAR.ALL
                        ? null : (
                            <SideMenu
                                list={thisState.categories}
                                handleClickList={this.handleClickList}
                                active={
                                    thisState.sideBar === SIDE_BAR.CATEGORIES
                                    ? thisState.selectedCategory
                                    : thisState.selectedAuthor
                                }
                                handleAddList={this.handleAddList}
                                handleEditList={this.handleEditList}
                                handleDeleteList={this.handleDeleteList}
                                handleDrop={this.handleDrop}
                            />
                        )
                    }
                    <div className="main-content">
                        {BookCaseContent}
                    </div>
                </div>
            </div>
        )
    },

    componentDidMount() {
        this.storeListener = Store.listen({
            getMangaInfo: this.handleAddedManga
        });
        RectangleSelection.setSelectbleElements(
            Array.from(
                document.getElementsByClassName('manga-wrap')
            ),
            'hash'
        );
        RectangleSelection.setSelectedElementsHandler(this.handlerMarqueenSelected);
        RectangleSelection.setDeselecteAllElementsHandler(this.handleDeselectAll);
        RectangleSelection.startListen();
    },

    handlerMarqueenSelected(hashList) {
        this.setState({
            rectangleSelected: new Set(hashList)
        });
    },

    handleDeselectAll() {
        if (this.state.rectangleSelected.size === 0)
            return;

        this.setState({
            rectangleSelected: new Set()
        });
    },
    
    componentWillUnmount() {
        Store.listenOff(this.storeListener);
    },

    handleDrop(event, categoryId) {

        // dataTransfer只支持字符串格式，数组会变成csv文本
        event.dataTransfer.getData("hash").split(',').map(
            hash => MangaManage.getManga(hash)
        ).forEach(
            manga => manga.setCategory(categoryId)
        );

        event.preventDefault();
    },

    handleSelectedManga(hash) {
        ipcRenderer.send('selected-manga', hash, this.state);
    },

    handleClickSidebarBtn(btnName) {

        const that = this;
        const thisState = this.state;

        if (btnName === thisState.sideBar) {
            return;
        }

        if (btnName === SIDE_BAR.ALL) {
            this.setState({
                sideBar: SIDE_BAR.ALL
            }, () => {
                RectangleSelection.setSelectbleElements(
                    Array.from(
                        document.getElementsByClassName('manga-wrap')
                    ),
                    'hash'
                );
            });
        } else if (btnName === SIDE_BAR.AUTHOR) {
            this.setState({

            });
        }  else if (btnName === SIDE_BAR.CATEGORIES) {
            this.setState({
                sideBar: SIDE_BAR.CATEGORIES
            }, () => {
                RectangleSelection.setSelectbleElements(
                    Array.from(
                        document.getElementsByClassName('manga-wrap')
                    ),
                    'hash'
                );
            });
        }  else if (thisState.sideBar === SIDE_BAR.EXPORT) {
            this.setState({

            });
        } else { // SIDE_BAR.CONFIG
            this.setState({

            });
        }
    },

    handleClickList(id) {
        this.setState({
            [this.state.sideBar === SIDE_BAR.CATEGORIES ? "selectedCategory" : "selectedAuthor"]: id
        });
    },

    handleAddList(name) {

        const that = this;
        const categories = MangaManage.addCategory(name);

        MangaManage.saveConfig().then(() => {
            that.setState({ categories });
        });
    },

    handleEditList(hash, newName) {
        MangaManage.editCategory(hash, newName);
        this.setState({
            categories: MangaManage.getCategory()
        });
    },

    handleDeleteList(hash) {
        MangaManage.deleteCategory(hash);
        this.setState({
            categories: MangaManage.getCategory(),
            selectedCategory: 0
        });
    },

    handleForceUpdate() {
        this.forceUpdate();
    },

    handleClickExportBtn() {
        ipcRenderer.once('show-directory-selector-reply', this.handleSelectedDirectory);
        ipcRenderer.send('show-directory-selector');
    },

    handleSelectedDirectory(event, selectedDirectories) {
        if (Array.isArray(selectedDirectories)) {
            Action.getMangaInfo(selectedDirectories);
        }
    },

    handleAddedManga(promise) {
        const that = this;
        promise.then(newManga =>
            new Promise(resolve => {
                that.setState({
                    sideBar: SIDE_BAR.ALL,
                    selectedCategory: 0,
                    selectedAuthor: 0,
                    authors: []
                }, resolve);
            })
        ).then(() => {
            RectangleSelection.setSelectbleElements(
                Array.from(
                    document.getElementsByClassName('manga-wrap')
                ),
                'hash'
            );
        })
    }
});

ipcRenderer.once('get-stateCache-reply', (event, cache) => {
    MangaManage.readConfigFile().then(() => {
        const Main = getMainComponent(cache);
        ReactDOM.render(<Main />, document.querySelector('.body'));
    });
});
ipcRenderer.send('get-stateCache');