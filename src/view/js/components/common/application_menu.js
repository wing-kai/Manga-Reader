const { remote, ipcRenderer, webFrame, shell } = require('electron');
const { Menu, MenuItem, app } = remote;

const editMenu = process.env.dev === "true" ? {
    label: '编辑',
    submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    }, {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
    }, {
        type: 'separator'
    }, {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
    }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
    }, {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
    }, {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    }]
} : {};

const viewMenu = process.env.dev === "true" ? {
    label: '视图',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
            if (focusedWindow)
                focusedWindow.reload();
        }
    }, {
        label: '全屏显示',
        accelerator: (() =>
            process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11'
        )(),
        click: (item, focusedWindow) => {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
    }, {
        label: 'Toggle Developer Tools',
        accelerator: (() =>
            process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I'
        )(),
        click: (item, focusedWindow) => {
            if (focusedWindow)
                focusedWindow.toggleDevTools();
        }
    }]
} : {
    label: '视图',
    submenu: [{
        label: '全屏显示',
        accelerator: (() =>
            process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11'
        )(),
        click: (item, focusedWindow) => {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
    }]
};

const windowMenu = {
    label: '窗口',
    role: 'window',
    submenu: [{
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }]
}

const helpMenu = {
    label: '帮助',
    role: 'help',
    submenu: [{
        label: '项目源码',
        click: () => {
            shell.openExternal('https://github.com/wing-kai/Manga-Reader')
        }
    }, {
        label: '问题报告',
        click: () => {
            shell.openExternal('https://github.com/wing-kai/Manga-Reader/issues')
        }
    }, {
        type: 'separator'
    }, {
        label: '共享许可',
        click: () => {
            shell.openExternal('https://github.com/wing-kai/Manga-Reader/blob/master/LICENSE')
        }
    }]
}

module.exports = {
    editMenu,
    viewMenu,
    windowMenu,
    helpMenu
}