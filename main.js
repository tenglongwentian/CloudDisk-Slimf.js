const electron = require('electron');
const ipc = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const Menu = electron.Menu;//引入菜单慕课
const url = require('url');
let LoginWindow,DiskWindow;
function CreateLoginWindow() {
	Menu.setApplicationMenu(null);
    LoginWindow = new BrowserWindow({
        width: 850,
        height: 550,
        title:'CloudDisk-登录',
        frame:false,
        maximizable:false,
        resizable:false
    });
    LoginWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    LoginWindow.webContents.openDevTools();
    LoginWindow.on('closed', function() {
        LoginWindow = null;
  });
}
function CreatDiskWindow() {
    Menu.setApplicationMenu(null);
    DiskWindow = new BrowserWindow({
        width: 850,
        height: 550,
        title:'CloudDisk',
        backgroundColor:'#fff',
        frame:false
    });
    DiskWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'disk.html'),
        protocol: 'file:',
        slashes: true
    }));
    DiskWindow.webContents.openDevTools();
    DiskWindow.on('closed', function() {
        DiskWindow = null;
    });
    DiskWindow.on('maximize',function () {
        DiskWindow.webContents.send('size', 1);
    });
    DiskWindow.on('unmaximize',function () {
        DiskWindow.webContents.send('size', -1);
    });
}
function BindIpc() {
    /*登录窗口*/
    ipc.on('login-success', function () {
        LoginWindow.setSize(800,300);
        var a=setTimeout(function () {
            clearTimeout(a);
            CreatDiskWindow();
            LoginWindow.close();
        },2000)
    });
    ipc.on('login-mini', function () {
        LoginWindow.minimize();
    });
    ipc.on('login-close', function () {
        app.quit()
    });
    /*网盘窗口*/
    ipc.on('disk-mini', function () {
        DiskWindow.minimize();
    });
    ipc.on('disk-mini', function () {

    });
    ipc.on('disk-change',function () {
        if (DiskWindow.isMaximized()) {
            DiskWindow.restore();
        } else {
            DiskWindow.maximize();
        }
    });
    ipc.on('disk-close', function () {
        DiskWindow.hide()
    });
}
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (LoginWindow) {
    if (LoginWindow.isMinimized()) LoginWindow.restore();
      LoginWindow.focus()
  }
});
if (shouldQuit) {
  app.quit()
}
app.on('ready', function (){
    BindIpc();
    CreateLoginWindow();
});
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function() {
  if (LoginWindow === null) {
      CreateLoginWindow();
  }
});