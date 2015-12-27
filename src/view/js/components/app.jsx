import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, Redirect } from 'react-router';
import { createHashHistory } from 'history';
import Flux from '../lib/flux/index';

import { remote, ipcRenderer } from 'electron';

import Home from '../components/index_component';

const { Menu } = remote;
const ipc = ipcRenderer;

const menu = Menu.buildFromTemplate([{
    label: name,
    submenu: [{
        label: 'About ' + name,
        click() {
            ipc.send('show-authro-info')
        }
    }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
            ipc.send('quit');
        }
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.reload();
        }
    }, {
        label: 'Toggle Full Screen',
        accelerator: (() => {
            if (process.platform == 'darwin')
                return 'Ctrl+Command+F';
            else
                return 'F11';
        })(),
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
    }, {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
            if (process.platform == 'darwin')
                return 'Alt+Command+I';
            else
                return 'Ctrl+Shift+I';
        })(),
        click(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.toggleDevTools();
        }
    }, ]
}]);

Menu.setApplicationMenu(menu);

let Body = (
    <Router history={createHashHistory()}>
        <Route path='/' component={Home} />
    </Router>
)

ReactDOM.render(Body, document.querySelector('.body'));