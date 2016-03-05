const React    = require('react');
const ReactDOM = require('react-dom');
const Titlebar = require('react-titlebar');
const { shouldComponentUpdate } = require('react-addons-pure-render-mixin');

const SideBar = require('../side_bar');
const MangaManage = require('../manga_manage');

const SIDE_BAR = {
    ALL: "SIDE_BAR_ALL",
    AUTHOR: "SIDE_BAR_AUTHOR",
    CATEGORIES: "SIDE_BAR_CATEGORIES",
    EXPORT: "SIDE_BAR_EXPORT",
    CONFIG: "SIDE_BAR_CONFIG"
}

const Container = props => (
    <div className="container" {...props}>{props.children}</div>
);

const SideMenu = React.createClass({
    getDefaultProps() {
        return {
            editable: false,
            list: [],
            selectItem: hash => {},
            selectedItem: '',
            addItem: newItem => {}
        }
    },
    getInitialState() {
        return {
            blur: true,
            active: "",
            edit: false,
            add: false,
            dragOver: false
        }
    },
    downInArea: false,
    render() {

        const thisState = this.state;
        const {
            editable,
            list,
            selectItem,
            selected
        } = this.props;

        return (
            <ul className={"side-menu" + (this.state.blur ? ' blur' : '')} onMouseDown={this.handleFocusList}>
                <li className={selected ? "" : "active"} onClick={() => selectItem('')}><div>全部</div></li>
                {
                    list.map(obj => (
                        <li className={selected === obj.hash ? 'active' : ''} key={obj.hash} onClick={() => selectItem(obj.hash)}>
                            <div>{obj.name}</div>
                        </li>
                    ))
                }
                <li className="add-list" onClick={this.handleClickAddItem}>
                    <div>
                    {
                        thisState.add
                        ? (
                            <input
                                ref="newItem"
                                type="text"
                                autoFocus={true}
                                onBlur={this.handleBlurAddItemInput}
                                onKeyPress={
                                    this.handleKeyPress.bind(this, this.handleBlurAddItemInput)
                                }
                            />
                        ) : '新建'
                    }
                    </div>
                </li>
            </ul>
        );
    },
    shouldComponentUpdate,
    componentWillReceiveProps() {
        this.setState({
            add: false
        })
    },
    handleFocusList(e) {
        this.downInArea = true;
        if (this.state.blur) {
            window.addEventListener('mousedown', this.handleBlurList);
            this.setState({
                blur: false
            });
        }
    },
    handleBlurList() {
        if (this.downInArea) {
            this.downInArea = false;
            return;
        }
        window.removeEventListener('mousedown', this.handleBlurList);
        if (this.isMounted()) {
            this.setState({
                blur: true
            });
        }
    },
    handleClickAddItem() {
        this.setState({
            add: true
        });
    },
    handleBlurAddItemInput() {
        const newItem = this.refs.newItem.value.trim();
        if (newItem)
            this.props.addItem(this.refs.newItem.value.trim());
        else {
            this.setState({
                add: false
            });
        }
    },
    handleKeyPress(func, event) {
        event.key === "Enter" && func();
    }
});

const Bookcase = props => (
    <div className="book-list">
        {
            props.list.map(manga => {
                return (
                    <div className="manga-wrap" key={manga.get('hash')}>
                        <img src={manga.get('cover')} alt="" width="140" minHeight="200" />
                        <label>{manga.get('title')}</label>
                        <small>{manga.get('author') || '未知作者'}</small>
                    </div>
                )
            })
        }
    </div>
);

const Body = React.createClass({
    getInitialState() {
        return {
            sideBar: SIDE_BAR.ALL,
            selectedCategory: '',
            selectedAuthor: ''
        }
    },

    render() {

        const {
            sideBar,
            selectedCategory,
            selectedAuthor
        } = this.state;

        let sideMenuList, bookcaseList, selectedItem;

        switch (sideBar) {
            case SIDE_BAR.CATEGORIES:
                sideMenuList = MangaManage.getCategory().map(obj => ({hash: obj.get('hash'), name: obj.get('name')}) );
                selectedItem = selectedCategory;
                bookcaseList = selectedCategory ? MangaManage.getCategory(selectedCategory) : MangaManage.getManga();
                break;
            case SIDE_BAR.AUTHOR:
                sideMenuList = MangaManage.getAuthor().map(kv => ({hash: kv, name: kv}) );
                selectedItem = selectedAuthor;
                bookcaseList = selectedAuthor ? MangaManage.getAuthor(selectedAuthor) : MangaManage.getManga();
                break;
            default:
                sideMenuList = [];
                bookcaseList = MangaManage.getManga();
                break;
        }

        return (
            <div className="home">
                <Titlebar />
                <Container>
                    <SideBar
                        active={sideBar}
                        onClick={this.handleClickSidebarBtn}
                        handleSelectedFile={this.handleSelectedFile}
                    />
                    {
                        sideBar !== SIDE_BAR.ALL
                        ? <SideMenu list={sideMenuList} addItem={this.handleAddItem} selectItem={this.handleSelectItem} selected={selectedItem} />
                        : null
                    }
                    <Bookcase list={bookcaseList} />
                </Container>
            </div>
        )
    },
    shouldComponentUpdate,
    handleClickSidebarBtn(btn) {
        this.setState({
            sideBar: btn
        })
    },
    handleSelectedFile(files) {
        const that = this;
        MangaManage.importManga(
            Array.from(files)
        ).then(newMangaList => {
            console.log(newMangaList)
            that.forceUpdate();
        });
    },
    handleSelectItem(hash) {
        
        const { sideBar } = this.state;
        let updateStateKey;

        switch (sideBar) {
            case SIDE_BAR.CATEGORIES:
                updateStateKey = 'selectedCategory'
                break;
            case SIDE_BAR.AUTHOR:
                updateStateKey = 'selectedAuthor'
                break;
            default:
                throw TypeError('Unknow sideBar state: ' + this.state.sideBar);
        }

        this.setState({
            [updateStateKey]: hash
        });
    },
    handleAddItem(value) {
        if (this.state.sideBar === SIDE_BAR.CATEGORIES) {
            MangaManage.addCategory(value);
            this.forceUpdate();
        }
    }
});

MangaManage.initConfigFile().then(() => {
    ReactDOM.render(
        <Body />,
        document.getElementById('body')
    );
});