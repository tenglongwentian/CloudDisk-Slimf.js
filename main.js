const electron = require('electron');
const ipc = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const Menu = electron.Menu;//引入菜单慕课
const url = require('url');
const Tray = electron.Tray;//引入托盘模块
let LoginWindow,DiskWindow,SettingWindow;
let message={
    appName:'CloudDisk',
    error:'检查更新出错, 请联系开发人员',
    checking:'正在检查更新……',
    updateAva:'检测到新版本，正在下载……',
    updateNotAva:'现在使用的就是最新版本，不用更新',
    downloaded: '最新版本已下载，点击安装进行更新'
};
var appTray = null;//托盘变量
var trayMenuTemplate = [//托盘菜单
    {
        label: '我的网盘',//菜单显示文本项
        click: function () {
            DiskWindow.show();//显示
            DiskWindow.restore();//窗口欢迎
            DiskWindow.focus();//窗口聚焦
        }
    },
    {
        label: '退出',
        click: function () {
            DiskWindow.close();
        }
    }
];
autoUpdater.setFeedURL('http://client.1473.cn/update');//设置检查更新的 url，并且初始化自动更新。这个 url 一旦设置就无法更改。
function CheckUpdate(event) {
    //当开始检查更新的时候触发
    autoUpdater.on('checking-for-update', function() {
        event.sender.send('check-for-update',message.checking);//返回一条信息
    });
    //当发现一个可用更新的时候触发，更新包下载会自动开始
    autoUpdater.on('update-available', function(info) {
        event.sender.send('update-down-success', info);
        event.sender.send('check-for-update',message.updateAva);//返回一条信息
    });
    //当没有可用更新的时候触发
    autoUpdater.on('update-not-available', function(info) {
        event.sender.send('check-for-update',message.updateNotAva);//返回一条信息
    });
    autoUpdater.on('error', function(error){
        event.sender.send('check-for-update',message.error);//返回一条信息
    });
    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
        //这个事件无法使用
        mainWindow.webContents.send('download-progress',progressObj)
    });
    autoUpdater.on('update-downloaded',  function () {
        event.sender.send('check-for-update',message.downloaded);//返回一条信息
        //通过main进程发送事件给renderer进程，提示更新信息
    });
    //执行自动更新检查
}
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
    LoginWindow.on('closed', function() {
        LoginWindow = null;
  });
}
function CreatDiskWindow() {
    Menu.setApplicationMenu(null);
    trayIcon = path.join(__dirname, 'public/img/ico');
    appTray = new Tray(path.join(trayIcon, 'app.ico'));
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('CloudDisk');
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
    appTray.on("click", function(){
        DiskWindow.isVisible() ? DiskWindow.hide() : DiskWindow.show();
    });
    DiskWindow = new BrowserWindow({
        width: 1200,
        minWidth:800,
        minHeight:728,
        height: 610,
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
function CreateDiskSetting() {
    SettingWindow = new BrowserWindow({
        width: 550,
        height: 300,
        title:'CloudDisk-设置',
        frame:false,
        maximizable:false,
        resizable:false
    });
    SettingWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    SettingWindow.on('closed', function() {
        SettingWindow = null;
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
    /*更新*/
    /*检查更新*/
    ipc.on('check-for-update', function(event, arg) {
        CheckUpdate(event);
        autoUpdater.checkForUpdates();
    });
    ipc.on('update', function(event, arg) {
        autoUpdater.quitAndInstall();
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