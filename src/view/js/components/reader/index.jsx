const React = require('react');
const ReactDOM = require('react-dom');
const { remote, ipcRenderer, webFrame } = require('electron');

const TitleBarManage = require("../title_bar");

const { VIEW_MODE, READ_MODE } = require('./constants');

const MangaManage = require('../../modules/manga_manage');
const { Menu, MenuItem } = remote;

let manga;

webFrame.setZoomLevelLimits(1, 1);

const Reader = React.createClass({

    getInitialState() {

        manga = MangaManage.getManga(ipcRenderer.sendSync('get-hashCache'));

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
                <div className="control-bar">
                    <div>
                        <button className="icon ico-log-out" title="退出" onClick={this.handleQuitReader} />
                        <button className="icon ico-eye" title="阅读" onClick={this.handleClickViewModeSwitch} id="btnViewModeSwitch" />
                        {
                            (thisState.viewMode === VIEW_MODE.DOUBLE) && (thisState.readMode === READ_MODE.TRADITION) ? [
                                <button className="icon ico-triangle-left" title="下一页" onClick={this.handleClickNextPage} key="next-page" />,
                                <button className="icon ico-triangle-right" title="上一页" onClick={this.handleClickPreviousPage} key="previous-page" />
                            ] : [
                                <button className="icon ico-triangle-left" title="上一页" onClick={this.handleClickPreviousPage} key="previous-page" />,
                                <button className="icon ico-triangle-right" title="下一页" onClick={this.handleClickNextPage} key="next-page" />
                            ]
                        }
                        <button className="icon ico-ccw" title="逆时针旋转90度" disabled={true} />
                        <button className="icon ico-cw" title="顺时针旋转90度" disabled={true} />
                        <button className="icon ico-tag" title="书签" disabled={true} />
                        <button
                            className="icon ico-level-down"
                            title="翻页模式"
                            id="btnReadModeSwitch"
                            onClick={this.handleClickReadModeSwitch}
                            disabled={thisState.viewMode !== VIEW_MODE.DOUBLE}
                        />
                    </div>
                    <div>
                        <input
                            id="page-range"
                            type="range"
                            defaultValue={thisState.pageNum}
                            min='0'
                            max={thisState.pageList.length - 1}
                            step={thisState.viewMode === VIEW_MODE.SINGLE ? 1 : 2}
                            value={thisState.pageNum}
                            onChange={this.handleDragPageRange}
                        />
                    </div>
                </div>
                {wrapContent}
            </div>
        )
    },

    componentDidMount() {
        const TitleBar = TitleBarManage.getComponent();
        TitleBarManage.renderComponent(
            <TitleBar handleClose={this.handleQuitReader} />
        )
    },

    handleQuitReader() {
        ipcRenderer.send('quit-reader');
    },

    handleDragPageRange() {
        this.setState({
            pageNum: document.getElementById("page-range").value
        })
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

    componentWillUpdate(nextProps, nextState) {
        if (nextState.viewMode !== VIEW_MODE.DOUBLE)
            window.removeEventListener('resize', this.handleScaleImage);
    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleScaleImage);
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
        MangaManage.saveConfig();
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
        MangaManage.saveConfig();
        this.setState(newState);
    }
})

MangaManage.readConfigFile().then(() => {
    ReactDOM.render(<Reader />, document.querySelector('.body'));
});