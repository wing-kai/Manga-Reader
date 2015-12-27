const { remote, ipcRenderer } = require('electron');
const { Menu } = remote;
const ipc = ipcRenderer;

var menu = Menu.buildFromTemplate([{
    label: name,
    submenu: [{
        label: 'About ' + name,
        click() {
            ipc.send('show-authro-info');
        }
    }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () { 
                ipc.send('quit');
             }
        }]
}, {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Full Screen',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Ctrl+Command+F';
                    else
                        return 'F11';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Alt+Command+I';
                    else
                        return 'Ctrl+Shift+I';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.toggleDevTools();
                }
            },
        ]
    }]
);

Menu.setApplicationMenu(menu);