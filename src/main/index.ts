import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'

Store.initRenderer()

const store = new Store();

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false, // 设置为 false 隐藏默认窗口标题栏
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      nodeIntegration: true,      //教程只有此项，无下方两个参数设置，如需支持node内方法需设置此三项
      contextIsolation: false,
    }
  })

  globalShortcut.register('CmdOrCtrl+Shift+M', () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore(); // 如果窗口已经最大化，则恢复它  
    } else {
      mainWindow?.minimize();
    }
  });
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 监听来自渲染进程的 'get-config' 消息  
  ipcMain.on('get-config', (event) => {
    // 获取配置并发送给渲染进程  
    const config = store.store; // 获取完整的配置对象  
    event.reply('config-reply', config);
  });

  ipcMain.on('save-data', (event, data) => {
    // 将从渲染进程接收到的数据保存到 store 中  
    store.set('list', data);
    // 如果需要，你可以发送一个回复给渲染进程  
    event.reply('data-saved-reply', 'Data saved successfully!');
  });
  ipcMain.on('cVideo', (event, data) => {
    console.log('cVideo', event);
    // 将从渲染进程接收到的数据保存到 store 中  
    store.set('cVideo', data);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('window-min', function () {
    const mainWindow = BrowserWindow.getFocusedWindow()
    mainWindow?.minimize();
  })
  //登录窗口最大化 
  ipcMain.on('window-max', function () {
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (mainWindow?.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow?.maximize();
    }
  })
  ipcMain.on('window-close', function () {
    const mainWindow = BrowserWindow.getFocusedWindow()
    mainWindow?.close();
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
