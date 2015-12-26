'use strict';

const electron = require('electron');

const ipc = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require("fs");

electron.crashReporter.start();

let mainWindow;
let appReady = new Promise(function(resolve) {
    app.on('ready', resolve);     
});

appReady.then(function() {
    mainWindow = new BrowserWindow({
        center: true
    });

    mainWindow.loadURL(`file://${__dirname}/view/html/index.html`);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});