require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const fs = require('fs')
const Config = require('./config')
const glob = require('glob')
const { app, session, shell, BrowserView, BrowserWindow } = require('electron')
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

  // Create Medium View
  let mediumView = new BrowserView({
    webPreferences: {
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'medium-process/mediumView.js'),
    }
  })

  function resizeMediumView () {
    mediumView.setBounds({
      x: 240,
      y: 0,
      width: mainWindow.getBounds().width - 240,
      height: mainWindow.getBounds().height
    })
  }

  mediumView.webContents.on('dom-ready', () => {
    mediumView.webContents.insertCSS(fs.readFileSync(path.join(__dirname, 'assets/css/mediumView.css'), 'utf8'))
  })
  mediumView.webContents.on('did-navigate', (event, url) => {
    if (url.startsWith('https://medium.com/new-story')) {
      console.log('New Story opened')
    }
  })
  mediumView.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

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
  mainWindow.setBrowserView(mediumView)
  mainWindow.on('resize', () => {
    resizeMediumView()
  })
  mainWindow.on('close', () => {
    if (!mainWindow.fullScreen) {
      store.set('lastWindowState', mainWindow.getBounds())
    }
  })
  mainWindow.on('closed', () => {
    mediumView = null
    mainWindow = null
  })

  // Loading Home Page
  mediumView.webContents.loadURL(Config.MEDIUMVIEW_HOME)
  resizeMediumView()
}