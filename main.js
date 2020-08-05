require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const glob = require('glob')
const {app, session, BrowserView, BrowserWindow} = require('electron')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('MediumDesk')

let mainWindow = null

function initialize () {
  makeSingleInstance()
  loadMainProcess()

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 800,
      height: 840,
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

    // Create Content View
    mainWindow.setBrowserView(new BrowserView({webPreferences: {allowRunningInsecureContent: true}}))
    mainWindow.getBrowserView().webContents.loadURL('https://medium.com/me/stories/drafts')
    resizeWindow(mainWindow)

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    mainWindow.on('resize', () => {
      resizeWindow(mainWindow)
    })
  }

  function resizeWindow (window) {
    window.getBrowserView().setBounds({ x: 240, y: 0, width: mainWindow.getBounds().width - 240, height: mainWindow.getBounds().height })
  }

  app.on('ready', () => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = session.defaultSession.getUserAgent().replace("Electron/" + process.versions.electron, "")
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function loadMainProcess () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize()
