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
            handleAddedItem: newItem => {}
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
        // const list = Store.getCategoryList();

        return (
            <ul className={"side-menu" + (this.state.blur ? ' blur' : '')} onMouseDown={this.handleFocusList}>
                <li className="active"><div>全部</div></li>
                <li className="add-list" onClick={this.handleClickAddItem}>
                    <div>
                    {
                        thisState.add
                        ? (
                            <input
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
        this.setState({
            add: false
        })
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
            sideBar: SIDE_BAR.ALL
        }
    },

    render() {
        const thisState = this.state;

        return (
            <div className="home">
                <Titlebar />
                <Container>
                    <SideBar    
                        active={thisState.sideBar}
                        onClick={this.handleClickSidebarBtn}
                        handleSelectedFile={this.handleSelectedFile}
                    />
                    {
                        thisState.sideBar !== SIDE_BAR.ALL
                        ? <SideMenu />
                        : null
                    }
                    <Bookcase list={MangaManage.getManga()} />
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
    }
});

MangaManage.initConfigFile().then(() => {
    ReactDOM.render(
        <Body />,
        document.getElementById('body')
    );
});