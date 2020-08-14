require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const Config = require('./config')
const glob = require('glob')
const { app, session, shell, BrowserView, BrowserWindow, ipcMain,dialog } = require('electron')
const Store = require('electron-store')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('MediumDesk')

let mainWindow = null
const store = new Store()

function initialize () {
  // Making Single Instance
  if (!process.mas) {
    app.requestSingleInstanceLock()
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }

  // Load Main Process
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })

  // App Events
  app.on('ready', () => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = session.defaultSession.getUserAgent().replace('Electron/' + process.versions.electron, '')
      callback({ cancel: false, requestHeaders: details.requestHeaders })
    })
    createWindow()
  })
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

initialize()

function createWindow () {

  // Create Main Window
  const lastWindowState = store.get('lastWindowState') || Config.WINDOW_SIZE
  const windowOptions = {
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 800,
    minHeight: 600,
    title: app.name,
    webPreferences: {
      nodeIntegration: true
    }
  }
  if (process.platform === 'linux') {
    windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
  }

  mainWindow = new BrowserWindow(windowOptions)
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
  mainWindow.on('resize', () => {
    mainWindow.getBrowserView().setBounds({
      x: 240,
      y: 32,
      width: mainWindow.getContentBounds().width - 240,
      height: mainWindow.getContentBounds().height - 32
    })
  })
  mainWindow.on('close', () => {
    if (!mainWindow.fullScreen) {
      store.set('lastWindowState', mainWindow.getBounds())
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })


  //ipc Messages
  let integrationTokenWin;
  ipcMain.on('import_a_story', (event) => {
    const userDetails = store.get('userDetails');
    if(userDetails){
      mainWindow.webContents.send('open_import_dialogue', userDetails)
    }else{
      integrationTokenWin = new BrowserWindow({
        width: 727,
        height: 509,
        show: true,
        webPreferences: {
            nodeIntegration: true
        }
      });
      // integrationTokenWin.webContents.openDevTools({mode:'undocked'})
      integrationTokenWin.loadURL(path.join('file://', __dirname, '/integrationToken.html'))
      integrationTokenWin.on('closed', () => {
        integrationTokenWin = null;
      });
    }
  })

  ipcMain.on('save_userDetails',(e,data)=>{
    store.set('userDetails',data)
    mainWindow.webContents.send('open_import_dialogue', data)
    integrationTokenWin && integrationTokenWin.close();
  })
  ipcMain.on('reset_token',(e,data)=>{
    store.set('userDetails',null)
  })
}