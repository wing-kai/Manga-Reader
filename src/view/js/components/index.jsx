const React = require('react');;
const ReactDOM = require('react-dom');
const { Router, Route, Link, IndexRoute, Redirect } = require('react-router');
const { createHashHistory } = require('history');

const Main = require('./main');
const ImportManage = require('./import_manage');
const BookList = require('./book_list');
const Reader = require('./reader');

const MangaManage = require('../modules/manga_manage');

let Body = (
    <Router history={createHashHistory()}>
        <Route path='/' component={Main}>
            <IndexRoute component={BookList} />
            <Route path='import' component={ImportManage} />
        </Route>
        <Route path='/reader/:hashId' component={Reader} />
    </Router>
)

MangaManage.readConfigFile().then(function(result) {
    ReactDOM.render(Body, document.querySelector('.body'));
});


// const { Menu } = remote;
// const ipc = ipcRenderer;

// const menu = Menu.buildFromTemplate([{
//     label: name,
//     submenu: [{
//         label: 'About ' + name,
//         click() {
//             ipc.send('show-authro-info')
//         }
//     }, {
//         label: 'Quit',
//         accelerator: 'Command+Q',
//         click() {
//             ipc.send('quit');
//         }
//     }]
// }, {
//     label: 'View',
//     submenu: [{
//         label: 'Reload',
//         accelerator: 'CmdOrCtrl+R',
//         click(item, focusedWindow) {
//             if (focusedWindow)
//                 focusedWindow.reload();
//         }
//     }, {
//         label: 'Toggle Full Screen',
//         accelerator: (() => {
//             if (process.platform == 'darwin')
//                 return 'Ctrl+Command+F';
//             else
//                 return 'F11';
//         })(),
//         click(item, focusedWindow) {
//             if (focusedWindow)
//                 focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
//         }
//     }, {
//         label: 'Toggle Developer Tools',
//         accelerator: (() => {
//             if (process.platform == 'darwin')
//                 return 'Alt+Command+I';
//             else
//                 return 'Ctrl+Shift+I';
//         })(),
//         click(item, focusedWindow) {
//             if (focusedWindow)
//                 focusedWindow.toggleDevTools();
//         }
//     }, ]
// }]);

// Menu.setApplicationMenu(menu);