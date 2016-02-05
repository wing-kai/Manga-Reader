const React = require('react');
const ReactDOM = require('react-dom');
const { ipcRenderer } = require('electron');

const wrap = document.createElement('div');
wrap.className = "title-bar-wrap";

const TitleBar = React.createClass({
    render() {
        return (
            <header className="title-bar">
                <div className="btn-wrap">
                    <button className="close" onClick={this.handleClickCloseBtn} />
                    <button className="minimize" onClick={this.handleClickMinimizeBtn} />
                    <button className="full-screen" onClick={this.handleClickFullScreenBtn} />
                </div>
                {this.props.children}
            </header>
        )
    },

    handleClickCloseBtn() {
        if ('handleClose' in this.props)
            return this.props.handleClose();

        ipcRenderer.send('title-bar-close');
    },
    handleClickMinimizeBtn() {
        if ('handleMinimize' in this.props)
            return this.props.handleMinimize();

        ipcRenderer.send('title-bar-minimize');
    },
    handleClickFullScreenBtn() {
        if ('handleFullScreen' in this.props)
            return this.props.handleFullScreen();

        ipcRenderer.send('title-bar-full-screen');
    }
});

const renderTitleBar = TtitleBarComponent => {
    document.body.insertBefore(wrap, document.getElementById("body"));
    ReactDOM.render(TtitleBarComponent, wrap);
}

const ummountComponent = component => {
    ReactDOM.unmountComponentAtNode(wrap);
    wrap.remove();
}

module.exports = {
    getComponent: () => TitleBar,
    renderComponent: renderTitleBar,
    ummountComponent: ummountComponent
}