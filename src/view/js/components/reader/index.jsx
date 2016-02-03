const React = require('react');
const { Link } = require('react-router');
const { VIEW_MODE, READ_MODE } = require('./constants');
const MangaManage = require('../../modules/manga_manage');
const { remote } = require('electron');
const { Menu, MenuItem } = remote;

let manga;

const Reader = React.createClass({

    getInitialState() {

        manga = MangaManage.getManga(this.props.params.hashId);

        return {
            pageList: manga ? manga.getPageFile() : [],
            pageNum: manga.get('lastReaded'),
            viewMode: manga.get('viewMode'),
            readMode: READ_MODE.TRADITION,
            imgALoaded: false,
            imgBLoaded: false,
            imgAStyle: {},
            imgBStyle: {}
        }
    },

    render() {
        const thisState = this.state;
        let wrapClass = "";
        let wrapContent;

        if (
            thisState.viewMode === VIEW_MODE.SINGLE // 单页模式
            || thisState.pageNum === 0 // 封面
            || thisState.pageNum === thisState.pageList.length - 1 // 封底
        ) {
            wrapContent = (
                <div className="wrap default" id='wrap'>
                    <img src={thisState.pageList[thisState.pageNum]} alt={thisState.pageNum} />
                </div>
            )
        } else if (thisState.viewMode === VIEW_MODE.DOUBLE) {
            wrapContent = (
                <div className="wrap double" id='wrap'>
                    {
                        thisState.readMode === READ_MODE.TRADITION ? [
                            <img
                                style={this.state.imgBStyle}
                                id='imgB'
                                key='imgB'
                                onLoad={this.handleImageLoaded.bind(this, "B")}
                                src={thisState.pageList[thisState.pageNum+1]}
                                alt={thisState.pageNum}
                            />,
                            <img
                                style={this.state.imgAStyle}
                                id='imgA'
                                key='imgA'
                                onLoad={this.handleImageLoaded.bind(this, "A")}
                                src={thisState.pageList[thisState.pageNum]}
                                alt={thisState.pageNum}
                            />
                        ] : [
                            <img
                                style={this.state.imgAStyle}
                                id='imgA'
                                key='imgA'
                                onLoad={this.handleImageLoaded.bind(this, "A")}
                                src={thisState.pageList[thisState.pageNum]}
                                alt={thisState.pageNum}
                            />,
                            <img
                                style={this.state.imgBStyle}
                                id='imgB'
                                key='imgB'
                                onLoad={this.handleImageLoaded.bind(this, "B")}
                                src={thisState.pageList[thisState.pageNum+1]}
                                alt={thisState.pageNum}
                            />
                        ]
                    }
                </div>
            )
        } else {
            wrapContent = null;
        }

        return (
            <div className="page-container" style={{background:"#000"}}>
                {wrapContent}
                <div className='control-bar'>
                    <Link to="/" className='btn'>退出</Link>
                    <button className='btn' onClick={this.handleClickViewModeSwitch} id="btnViewModeSwitch">阅读</button>
                    {
                        (thisState.viewMode === VIEW_MODE.DOUBLE) && (thisState.readMode === READ_MODE.TRADITION) ? [
                            <button key='nextpage' className='btn turn right' onClick={this.handleClickNextPage}>下一页</button>,
                            <input key='input' type="text" value={thisState.pageNum + 1} disabled={true} />,
                            <button key='previouspage' className='btn turn left' onClick={this.handleClickPreviousPage}>上一页</button>
                        ] : [
                            <button key='previouspage' className='btn turn left' onClick={this.handleClickPreviousPage}>上一页</button>,
                            <input key='input' type="text" value={thisState.pageNum + 1} disabled={true} />,
                            <button key='nextpage' className='btn turn right' onClick={this.handleClickNextPage}>下一页</button>
                        ]
                    }
                    <button className='btn' disabled={true}>书签</button>
                    <button
                        className='btn'
                        disabled={thisState.viewMode !== VIEW_MODE.DOUBLE}
                        onClick={this.handleClickReadModeSwitch}
                        id="btnReadModeSwitch"
                    >
                        模式
                    </button>
                </div>
            </div>
        )
    },

    handleClickReadModeSwitch() {

        const that = this;
        const thisState = this.state;
        const menu = new Menu();
        const boundingClientRect = document.getElementById('btnReadModeSwitch').getBoundingClientRect();

        menu.append(new MenuItem({
            label: '传统',
            type: 'checkbox',
            checked: thisState.readMode === READ_MODE.TRADITION,
            click: () => {
                that.setState({
                    readMode: READ_MODE.TRADITION
                });
            }
        }));
        menu.append(new MenuItem({
            label: '现代',
            type: 'checkbox',
            checked: thisState.readMode === READ_MODE.MORDEN,
            click: () => {
                that.setState({
                    readMode: READ_MODE.MORDEN
                });
            }
        }));

        menu.popup(remote.getCurrentWindow(), Number(boundingClientRect.left.toFixed(0)), boundingClientRect.top);
    },

    handleClickViewModeSwitch() {

        const that = this;
        const thisState = this.state;
        const menu = new Menu();
        const boundingClientRect = document.getElementById('btnViewModeSwitch').getBoundingClientRect();

        menu.append(new MenuItem({
            label: '单页',
            type: 'checkbox',
            checked: thisState.viewMode === VIEW_MODE.SINGLE,
            click: () => {
                manga.set({ viewMode: VIEW_MODE.SINGLE });
                that.setState({ viewMode: VIEW_MODE.SINGLE });
            }
        }));
        menu.append(new MenuItem({
            label: '双页',
            type: 'checkbox',
            checked: thisState.viewMode === VIEW_MODE.DOUBLE,
            click: () => {
                const newState = {
                    viewMode: VIEW_MODE.DOUBLE,
                    pageNum: thisState.pageNum
                }
                if (newState.pageNum % 2 === 1) {
                    newState.pageNum--;
                }
                manga.set({
                    viewMode: VIEW_MODE.DOUBLE,
                    lastReaded: newState.pageNum
                });
                that.setState(newState);
            }
        }));
        // menu.append(new MenuItem({
        //     label: '瀑布',
        //     type: 'checkbox',
        //     checked: thisState.viewMode === VIEW_MODE.WATERFALL,
        //     click: () => {
        //         that.setState({
        //             viewMode: VIEW_MODE.WATERFALL
        //         });
        //     }
        // }));

        menu.popup(remote.getCurrentWindow(), Number(boundingClientRect.left.toFixed(0)), boundingClientRect.top);
    },

    componentWillUpdate() {
        if (this.state.viewMode !== VIEW_MODE.DOUBLE)
            window.removeEventListener('resize', this.handleScaleImage);
    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleScaleImage);
        MangaManage.saveConfig();
        manga = undefined;
    },

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

        setState.then(() => {
            if (thisState.imgALoaded === thisState.imgBLoaded === true) {
                that.handleScaleImage();
                window.addEventListener('resize', that.handleScaleImage);
            }
        });
    },

    handleScaleImage() {

        const wrap = document.getElementById("wrap");
        const imgA = document.getElementById("imgA");
        const imgB = document.getElementById("imgB");

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
    },

    handleClickPreviousPage() {
        const thisState = this.state;
        let newState = {
            pageNum: thisState.pageNum
        }

        if (newState.pageNum !== 0) {
            if (thisState.viewMode === VIEW_MODE.SINGLE) {
                newState.pageNum--;
            } else if (thisState.viewMode === VIEW_MODE.DOUBLE) {
                newState.pageNum = newState.pageNum === 1 ? 0 : newState.pageNum - 2;
            } else {
                // waterfall...
            }
        }

        manga.set({ lastReaded: newState.pageNum });
        this.setState(newState);
    },

    handleClickNextPage() {
        const thisState = this.state;
        let newState = {
            pageNum: thisState.pageNum
        }

        if (thisState.pageNum !== thisState.pageList.length - 1) {
            if (thisState.viewMode === VIEW_MODE.SINGLE) {
                newState.pageNum++;
            } else if (thisState.viewMode === VIEW_MODE.DOUBLE) {
                newState.pageNum = newState.pageNum === 0 ? 1 : newState.pageNum + 2;
            } else {
                // waterfall...
            }
        }

        manga.set({ lastReaded: newState.pageNum });
        this.setState(newState);
    }
})

module.exports = Reader;