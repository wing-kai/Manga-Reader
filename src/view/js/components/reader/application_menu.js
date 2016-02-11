const { remote, ipcRenderer, webFrame, shell } = require('electron');
const { VIEW_MODE, READ_MODE } = require('./constants');
const publicMenu = require('../common/application_menu');
const { Menu, MenuItem, app } = remote;

const setApplicationMenu = (component) => {

    const thisState = component.state;

    const menuTemplate = [{
            submenu: [{
                label: '关于 ' + app.getName(),
                role: 'about'
            }, {
                label: '退出阅读',
                click: component.handleQuitReader
            }, {
                type: 'separator'
            }, {
                label: '退出',
                accelerator: 'Command+Q',
                click: app.quit
            }]
        }, {
            label: '显示',
            submenu: [{
                label: '单页',
                type: 'radio',
                checked: thisState.viewMode === VIEW_MODE.SINGLE,
                click: thisState.viewMode === VIEW_MODE.DOUBLE ? component.handleSetSingleViewMode : null
            }, {
                label: '双页',
                type: 'radio',
                checked: thisState.viewMode === VIEW_MODE.DOUBLE,
                click: thisState.viewMode === VIEW_MODE.SINGLE ? component.handleSetDoubleViewMode : null
            }, {
                type: 'separator'
            }, {
                label: '充满屏幕',
                type: 'checkbox',
                enabled: thisState.viewMode === VIEW_MODE.SINGLE,
                checked: thisState.viewMode === VIEW_MODE.DOUBLE ? true : thisState.viewMode === VIEW_MODE.SINGLE && thisState.isCoverScreen,
                click: component.handleSwitchCoverScreen
            }, {
                type: 'separator',
                enabled: false
            }, {
                label: '向左翻页（传统）',
                type: 'radio',
                checked: thisState.readMode === READ_MODE.TRADITION,
                click: () => {
                    if (thisState.readMode === READ_MODE.MORDEN) {
                        component.setState({
                            readMode: READ_MODE.TRADITION
                        }, component.handleDrawCanvas);
                    }
                }
            }, {
                label: '向右翻页（现代）',
                type: 'radio',
                checked: thisState.readMode === READ_MODE.MORDEN,
                click: () => {
                    if (thisState.readMode === READ_MODE.TRADITION) {
                        component.setState({
                            readMode: READ_MODE.MORDEN
                        }, component.handleDrawCanvas);
                    }
                }
            }, {
                type: 'separator'
            }, {
                label: '顺时针旋转90˚',
                enabled: false
            }, {
                label: '逆时针旋转90˚',
                enabled: false
            }]
        }, {
            label: '前往',
            submenu: [{
                label: '上一页',
                click: component.handleClickPreviousPage
            }, {
                label: '下一页',
                click: component.handleClickNextPage
            }, {
                type: 'separator'
            }, {
                label: '书签',
                enabled: false,
                // submenu: []
            }]
        },
        publicMenu.editMenu,
        publicMenu.viewMenu,
        publicMenu.windowMenu,
        publicMenu.helpMenu
    ];

    Menu.setApplicationMenu(
        Menu.buildFromTemplate(menuTemplate)
    );
}

module.exports = setApplicationMenu;