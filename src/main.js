'use strict';

const electron = require('electron');
const fs = require('fs');

const { app, BrowserWindow, ipcMain, dialog } = electron;

let mainWindow, readerWindow;
let stateCache = false;
let hashCache = false;
let isClickClose = true;

const openMainWindow = () => {
    mainWindow = new BrowserWindow({
        center: true,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden', // OS X only
        title: 'Manga-Reader'
    });

    if (process.env.dev === "true")
        mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/view/html/index.html`);

    mainWindow.on('closed', () => {
        if (isClickClose)
            app.quit();

        isClickClose = true;
        mainWindow = null;
    });
}

const openReaderWindow = () => {
    readerWindow = new BrowserWindow({
        center: true,
        width: 460,
        height: 690,
        minWidth: 460,
        minHeight: 690,
        frame: false
    });

    if (process.env.dev === "true")
        readerWindow.webContents.openDevTools();
    readerWindow.loadURL(`file://${__dirname}/view/html/reader.html`);

    readerWindow.on('closed', () => {
        readerWindow = null;
    });

    readerWindow.on('enter-full-screen', event => {
        event.sender.send('is-full-screen-reply', true);
    });

    readerWindow.on('leave-full-screen', event => {
        event.sender.send('is-full-screen-reply', false);
    });
}

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

ipcMain.on('selected-manga', (event, hash, state) => {
    stateCache = state;
    hashCache = hash;
    isClickClose = false;
    mainWindow.close();
    openReaderWindow();
});

ipcMain.on('get-stateCache', event => {
    event.sender.send('get-stateCache-reply', stateCache);
});
ipcMain.on('get-hashCache', event => {
    event.sender.send('get-hashCache-reply', hashCache);
});

ipcMain.on('title-bar-close', event => {
    mainWindow ? mainWindow.close() : readerWindow.close();
});
ipcMain.on('title-bar-minimize', event => {
    mainWindow ? mainWindow.minimize() : readerWindow.minimize();
});
ipcMain.on('title-bar-full-screen', event => {
    mainWindow
    ? mainWindow.setFullScreen(!mainWindow.isFullScreen())
    : readerWindow.setFullScreen(!readerWindow.isFullScreen())
});

ipcMain.on('quit-reader', () => {
    readerWindow.close();
    openMainWindow();
});

ipcMain.on('quit', app.quit);
app.on('ready', openMainWindow);