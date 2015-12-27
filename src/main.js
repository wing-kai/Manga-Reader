'use strict';

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const ipc = ipcMain;
const fs = require("fs");

electron.crashReporter.start();

let mainWindow;
let appReady = new Promise(function(resolve) {
    app.on('ready', resolve);     
});

ipc.on('show-authro-info', function() {
    
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

    authorInfoWindow.on('closed', function() {
        authorInfoWindow = null;
    });
});

ipc.on('quit', app.quit);

appReady.then(function() {
    mainWindow = new BrowserWindow({
        center: true,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden', // OS X only
        title: 'Manga-Reader'
    });

    mainWindow.loadURL(`file://${__dirname}/view/html/index.html`);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});