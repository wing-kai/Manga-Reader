const React = require('react');
const { shouldComponentUpdate } = require('react-addons-pure-render-mixin');
const Util  = require('../util');
const MangaManage = require('../manga_manage');

const SIDE_BAR = {
    ALL: "SIDE_BAR_ALL",
    AUTHOR: "SIDE_BAR_AUTHOR",
    CATEGORIES: "SIDE_BAR_CATEGORIES",
    EXPORT: "SIDE_BAR_EXPORT",
    CONFIG: "SIDE_BAR_CONFIG"
}

const Btn = props => (
    <button
        className={"icon ico-" + props.icon + (props.active ? " active" : "")}
        {...props}
    />
)

const SideBar = React.createClass({
    getDefaultProps() {
        return {
            active: SIDE_BAR.ALL
        }
    },
    getInitialState() {
        return {
            blur: true
        }
    },
    downInArea: false,
    render() {
        const { active } = this.props;

        return (
            <div ref="sideBar" className={"side-bar" + (this.state.blur ? " blur" : "")}>
                <Btn icon="box" active={active === SIDE_BAR.ALL} onMouseDown={this.handleClickBtn.bind(this, SIDE_BAR.ALL)} />
                <Btn icon="list" active={active === SIDE_BAR.CATEGORIES} onMouseDown={this.handleClickBtn.bind(this, SIDE_BAR.CATEGORIES)} />
                <Btn icon="users" active={active === SIDE_BAR.AUTHOR} onMouseDown={this.handleClickBtn.bind(this, SIDE_BAR.AUTHOR)} />
                <div style={{flex:1}} />
                <Btn icon="plus" active={active === SIDE_BAR.EXPORT} onClick={this.handleSelectedFile} />
                <Btn icon="cog" active={active === SIDE_BAR.CONFIG} />
            </div>
        )
    },
    shouldComponentUpdate,
    handleClickBtn(btn) {
        this.downInArea = true;
        const that = this;

        const promise = new Promise(resolve => {
            if (that.state.blur) {
                window.addEventListener('mousedown', that.handleBlur);
                that.setState({
                    blur: false
                }, resolve);
            } else {
                resolve();
            }
        });

        promise.then(() => {
            that.props.onClick(btn);
        });
    },
    handleBlur() {
        if (this.downInArea) {
            this.downInArea = false;
            return;
        }

        window.removeEventListener('mousedown', this.handleBlur);
        this.setState({
            blur: true
        });
    },
    handleSelectedFile() {
        const { handleSelectedFile } = this.props;
        const input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('multiple', 'multiple');
        input.setAttribute('accept', 'application/pdf,application/epub+zip,application/zip');
        input.onchange = function() {
            handleSelectedFile(this.files);
            this.value = null;
        }
        input.click();
    }
});

module.exports = SideBar;