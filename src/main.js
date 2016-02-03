'use strict';

const electron = require('electron');
const fs = require('fs');

const { app, BrowserWindow, ipcMain, dialog } = electron;

electron.crashReporter.start();

let mainWindow;

ipcMain.on('show-directory-selector', event => {
    /**
     * 这里的回调不能改为Promise的形式，
     * 不然的话每次都需要窗口失去焦点后才可以触发回调
     * 所以只能使用传统的回调写法……
     */

    let selectedDir = directories => {
        event.sender.send('show-directory-selector-reply', directories);
    };

    dialog.showOpenDialog({
        properties: [ 'openDirectory', 'multiSelections' ]
    }, selectedDir);
});

ipcMain.on('show-authro-info', () => {
    
    let authorInfoWindow;

    authorInfoWindow = new BrowserWindow({
        center: true,
        height: 300,
        width: 400,
        resizable: false,
        type: 'textured',
        alwaysOnTop: true,
        title: 'About',
        fullscreen: false
    });
    
    authorInfoWindow.loadURL(`file://${__dirname}/view/html/author_info.html`);

    authorInfoWindow.on('closed', () => {
        authorInfoWindow = null;
    });
});

ipcMain.on('quit', app.quit);

// disable zoom
app.commandLine.appendSwitch('--enable-viewport-meta', 'true');

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        center: true,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden', // OS X only
        title: 'Manga-Reader'
    });

    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/view/html/index.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });    
});