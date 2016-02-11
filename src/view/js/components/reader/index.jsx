const React = require('react');
const ReactDOM = require('react-dom');
const { remote, ipcRenderer, webFrame } = require('electron');

const TitleBarManage = require("../title_bar");

const { VIEW_MODE, READ_MODE } = require('./constants');
const setApplicationMenu = require('./application_menu');

const MangaManage = require('../../modules/manga_manage');
const { Menu, MenuItem } = remote;


let setTimeOutId = false;

require('../common/global');
webFrame.setZoomLevelLimits(1, 1);
document.addEventListener('dragstart', event => {
    event.preventDefault();
    return false;
});

const getReaderComponent = manga => React.createClass({
    getInitialState() {
        return {
            pageList: manga ? manga.getPageFile() : [],
            pageNum: manga.get('lastReaded'),
            viewMode: manga.get('viewMode'),
            readMode: READ_MODE.MORDEN,
            isCoverScreen: false,
            isFullScreen: false,
            showControlBar: false,
            canvasStyle: {
                width: 0,
                height: 0
            },
        }
    },

    render() {
        const thisState = this.state;
        const imgStyle = {};
        let wrapClass = "";
        let wrapContent;

        if (thisState.viewMode === VIEW_MODE.SINGLE) {
            if (thisState.isCoverScreen) {
                imgStyle.objectFit = "cover";
                imgStyle.maxHeight = "none";
            } else {
                imgStyle.objectFit = "contain";
                imgStyle.maxHeight = "100%";
            }
        }

        if (
            thisState.viewMode === VIEW_MODE.SINGLE // 单页模式
            || thisState.pageNum === 0 // 封面
            || thisState.pageNum === thisState.pageList.length - 1 // 封底
        ) {
            wrapContent = (
                <div className="wrap default" id='wrap' style={(thisState.viewMode === VIEW_MODE.SINGLE) && thisState.isCoverScreen ? {display:'block'} : {}}>
                    <img
                        src={thisState.pageList[thisState.pageNum]}
                        alt={thisState.pageNum}
                        style={imgStyle}
                    />
                </div>
            )
        } else if (thisState.viewMode === VIEW_MODE.DOUBLE) {
            wrapContent = (
                <div id="wrap" className="wrap default">
                    <canvas id="canvas" width={thisState.canvasStyle.width} height={thisState.canvasStyle.height} />
                </div>
            )
        } else {
            wrapContent = null;
        }

        return (
            <div className="page-container" style={{background:"#000"}} id="page-container">
                <div className="control-bar" style={ thisState.isFullScreen ? { opacity: thisState.showControlBar ? 1 : 0 } : {} }>
                    <div>
                        <button className="icon ico-log-out" title="退出" onClick={this.handleQuitReader} />
                        <button className="icon ico-eye" title="阅读" onClick={this.handleClickViewModeSwitch} id="btnViewModeSwitch" />
                        <button
                            className={"icon ico-" + (thisState.isCoverScreen ? "resize-100" : "resize-full-screen")}
                            title="充满屏幕"
                            disabled={thisState.viewMode !== VIEW_MODE.SINGLE}
                            onClick={this.handleSwitchCoverScreen}
                        />
                        {
                            thisState.readMode === READ_MODE.TRADITION ? [
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
                            className={"icon " + (thisState.readMode === READ_MODE.MORDEN ? "ico-level-down" : "ico-level-up")}
                            title="翻页模式"
                            id="btnReadModeSwitch"
                            onClick={this.handleClickReadModeSwitch}
                        />
                    </div>
                    <div>
                        <input
                            id="page-range"
                            type="range"
                            min='0'
                            max={thisState.pageList.length - 1}
                            step='1'
                            value={thisState.readMode === READ_MODE.MORDEN ? thisState.pageNum : thisState.pageList.length - thisState.pageNum - 1}
                            onChange={this.handleDragPageRange}
                        />
                        <div className="page-num">{thisState.pageNum + 1}</div>
                    </div>
                </div>
                {wrapContent}
            </div>
        )
    },

    componentDidMount() {
        const TitleBar = TitleBarManage.getComponent();
        const thisState = this.state;
        const that = this;

        TitleBarManage.renderComponent(
            <TitleBar handleClose={this.handleQuitReader} />
        );

        if (thisState.viewMode === VIEW_MODE.DOUBLE) {
            this.handleDrawCanvas();
        }

        window.addEventListener('keydown', this.handleKeyDown);
        ipcRenderer.on('is-full-screen-reply', this.handleEnterFullScreenMode);
        setApplicationMenu(this);
    },

    componentDidUpdate() {
        setApplicationMenu(this);
    },

    handleSwitchCoverScreen() {
        this.setState({
            isCoverScreen: !this.state.isCoverScreen
        });
    },

    handleKeyDown(event) {
        if (this.state.readMode === READ_MODE.MORDEN) {
            if (event.keyIdentifier === "Up" || event.keyIdentifier === "Left")
                this.handleClickPreviousPage();
            if (event.keyIdentifier === "Down" || event.keyIdentifier === "Right")
                this.handleClickNextPage();
        } else {
            if (event.keyIdentifier === "Down" || event.keyIdentifier === "Left")
                this.handleClickNextPage();
            if (event.keyIdentifier === "Up" || event.keyIdentifier === "Right")
                this.handleClickPreviousPage();
        }
    },

    handleMouseMove() {

        const that = this;
        const hideControlBar = () => {
            if (that.state.isFullScreen) {
                that.setState({ showControlBar: false });
                TitleBarManage.ummountComponent();
            }
        }

        if (that.state.showControlBar) {
            clearTimeout(setTimeOutId);
            setTimeOutId = setTimeout(hideControlBar, 2000);
        } else {
            that.setState({
                showControlBar: true
            });
            const TitleBar = TitleBarManage.getComponent();
            TitleBarManage.renderComponent(
                <TitleBar handleClose={this.handleQuitReader} />
            );

            setTimeOutId = setTimeout(hideControlBar, 2000);
        }
    },

    handleEnterFullScreenMode(event, isFullScreen) {
        if (isFullScreen) {
            TitleBarManage.ummountComponent();
            window.addEventListener('mousemove', this.handleMouseMove)
        } else {
            window.removeEventListener('mousemove', this.handleMouseMove);
            const TitleBar = TitleBarManage.getComponent();
            TitleBarManage.renderComponent(
                <TitleBar handleClose={this.handleQuitReader} />
            );
        }

        this.setState({ isFullScreen });
    },

    handleShowControlBar(showControlBar) {
        this.setState({ showControlBar });
    },

    handleDrawCanvas() {
        const that = this;
        const thisState = this.state;
        const imgA = new Image();
        const imgB = new Image();

        if (
            thisState.viewMode !== VIEW_MODE.DOUBLE
            || thisState.pageNum === 0 // 封面
            || thisState.pageNum === thisState.pageList.length - 1 // 封底
        )
            return;

        if (thisState.pageNum % 2 === 1) {
            imgA.src = thisState.pageList[thisState.pageNum];
            imgB.src = thisState.pageList[thisState.pageNum + 1];
        } else {
            imgA.src = thisState.pageList[thisState.pageNum - 1];
            imgB.src = thisState.pageList[thisState.pageNum];
        }


        Promise.all([
            new Promise(resolve => { imgA.onload = resolve }),
            new Promise(resolve => { imgB.onload = resolve })
        ]).then(() => {
            imgB.width = +(imgA.height * imgB.width / imgB.height).toFixed(0);
            imgB.height = imgA.height;
            return new Promise(resolve => {
                that.setState({
                    canvasStyle: {
                        width: imgA.width + imgB.width,
                        height: imgA.height
                    }
                }, resolve);
            });
        }).then(() => {
            if (document.getElementById("canvas")) {
                const canvas = document.getElementById("canvas").getContext('2d');
                canvas.clearRect(0, 0, 9999, 9999);
                if (thisState.readMode === READ_MODE.MORDEN) {
                    canvas.drawImage(imgA, 0, 0);
                    canvas.drawImage(imgB, imgA.width, 0, imgB.width, imgB.height);
                } else {
                    canvas.drawImage(imgB, 0, 0);
                    canvas.drawImage(imgA, imgB.width, 0, imgA.width, imgA.height);
                }
            }
        });
    },

    // 退出阅读器
    handleQuitReader() {
        ipcRenderer.send('quit-reader');
    },

    // 拖动页码滑块
    handleDragPageRange() {

        let newPageNum = 0;
        const thisState = this.state;

        if (thisState.readMode === READ_MODE.TRADITION)
            newPageNum = thisState.pageList.length - 1 - (+document.getElementById("page-range").value)
        else
            newPageNum = +document.getElementById("page-range").value;

        if (thisState.viewMode === VIEW_MODE.SINGLE && thisState.isCoverScreen)
            document.getElementById("page-container").scrollTop = 0;

        manga.set({ lastReaded: newPageNum });
        MangaManage.saveConfig();
        this.setState({
            pageNum: manga.get('lastReaded')
        }, this.handleDrawCanvas);
    },

    // 切换翻页方向
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
                if (thisState.readMode === READ_MODE.MORDEN) {
                    that.setState({
                        readMode: READ_MODE.TRADITION
                    }, that.handleDrawCanvas);
                }
            }
        }));
        menu.append(new MenuItem({
            label: '现代',
            type: 'checkbox',
            checked: thisState.readMode === READ_MODE.MORDEN,
            click: () => {
                if (thisState.readMode === READ_MODE.TRADITION) {
                    that.setState({
                        readMode: READ_MODE.MORDEN
                    }, that.handleDrawCanvas);
                }
            }
        }));

        menu.popup(remote.getCurrentWindow(), Number(boundingClientRect.left.toFixed(0)), boundingClientRect.top);
    },

    // 切换阅读模式
    handleClickViewModeSwitch() {
        const that = this;
        const thisState = this.state;
        const menu = new Menu();
        const boundingClientRect = document.getElementById('btnViewModeSwitch').getBoundingClientRect();

        menu.append(new MenuItem({
            label: '单页',
            type: 'checkbox',
            checked: thisState.viewMode === VIEW_MODE.SINGLE,
            click: this.handleSetSingleViewMode
        }));
        menu.append(new MenuItem({
            label: '双页',
            type: 'checkbox',
            checked: thisState.viewMode === VIEW_MODE.DOUBLE,
            click: this.handleSetDoubleViewMode
        }));

        menu.popup(remote.getCurrentWindow(), Number(boundingClientRect.left.toFixed(0)), boundingClientRect.top);
    },
    handleSetSingleViewMode() {
        manga.set({ viewMode: VIEW_MODE.SINGLE });
        MangaManage.saveConfig();
        this.setState({ viewMode: VIEW_MODE.SINGLE });
    },
    handleSetDoubleViewMode() {
        const thisState = this.state;
        manga.set({
            viewMode: VIEW_MODE.DOUBLE,
            lastReaded: thisState.pageNum
        });
        MangaManage.saveConfig();
        this.setState({
            viewMode: VIEW_MODE.DOUBLE,
            pageNum: thisState.pageNum,
            canvasStyle: {
                width: 0,
                height: 0
            }
        }, this.handleDrawCanvas);
    },

    handleClickPreviousPage() {
        const thisState = this.state;
        const newState = {
            pageNum: thisState.pageNum === 0 ? thisState.pageNum : thisState.pageNum - 1
        }

        if (thisState.viewMode === VIEW_MODE.SINGLE && thisState.isCoverScreen)
            document.getElementById("page-container").scrollTop = 0;

        manga.set({ lastReaded: newState.pageNum });
        MangaManage.saveConfig();
        this.setState(newState, this.handleDrawCanvas);
    },

    handleClickNextPage() {
        const thisState = this.state;
        const newState = {
            pageNum: (thisState.pageNum === thisState.pageList.length - 1) ? thisState.pageNum : thisState.pageNum + 1
        }

        if (thisState.viewMode === VIEW_MODE.SINGLE && thisState.isCoverScreen)
            document.getElementById("page-container").scrollTop = 0;

        manga.set({ lastReaded: newState.pageNum });
        MangaManage.saveConfig();
        this.setState(newState, this.handleDrawCanvas);
    }
});

ipcRenderer.once('get-hashCache-reply', (event, hash) => {
    MangaManage.readConfigFile().then(() => {
        const Reader = getReaderComponent(MangaManage.getManga(hash));
        ReactDOM.render(<Reader />, document.querySelector('.body')); 
    });
});
ipcRenderer.send('get-hashCache');