const path = require("path");
const Config = require("./config");
const glob = require("glob");
const { app, session, BrowserWindow, ipcMain, dialog } = require("electron");
const Store = require("electron-store");

const { autoUpdater } = require("electron-updater")
const debug = /--debug/.test(process.argv[2]);

if (process.mas) app.setName("MediumDesk");

let mainWindow = null;
const store = new Store();

function initialize() {
  // Making Single Instance
  if (!process.mas) {
    app.requestSingleInstanceLock();
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }

  // Load Main Process
  const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
  files.forEach((file) => {
    require(file);
  });

  // App Events
  app.on("ready", () => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        details.requestHeaders[
          "User-Agent"
        ] = session.defaultSession
          .getUserAgent()
          .replace("Electron/" + process.versions.electron, "");
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      }
    );
    createWindow();
    autoUpdater.checkForUpdates()
    autoUpdater.logger = require("electron-log")
  });
  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  autoUpdater.on('checking-for-update', () => {
    showUpdateMessage('Checking for update...')
  })
  
  autoUpdater.on('update-available', (info) => {
    showUpdateMessage('Update available.')
  })
  
  autoUpdater.on('update-not-available', (info) => {
    showUpdateMessage('Update not available.')
  })
  
  autoUpdater.on('error', (err) => {
    showUpdateMessage('Error in auto-updater. ' + err)
  })
  
  
  autoUpdater.on('update-downloaded', (info) => {
    showUpdateMessage('Update downloaded')
  })


}

initialize();

function createWindow() {
  // Create Main Window
  const lastWindowState = store.get("lastWindowState") || Config.WINDOW_SIZE;
  const windowOptions = {
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 1000,
    minHeight: 600,
    title: app.name,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
    },
  };
  if (process.platform === "linux") {
    windowOptions.icon = path.join(__dirname, "/assets/app-icon/png/512.png");
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL(path.join("file://", __dirname, "/index.html"));
  mainWindow.on("resize", () => {
    mainWindow.getBrowserView().setBounds({
      x: 0,
      y: 80,
      width: mainWindow.getContentBounds().width,
      height: mainWindow.getContentBounds().height - 80,
    });
  });
  mainWindow.on("close", () => {
    if (!mainWindow.fullScreen) {
      store.set("lastWindowState", mainWindow.getBounds());
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  //ipc Messages
  let integrationTokenWin;
  ipcMain.on("import_a_story", (event) => {
    const userDetails = store.get("userDetails");
    if (userDetails) {
      mainWindow.webContents.send("open_import_dialogue", userDetails);
    } else {
      integrationTokenWin = new BrowserWindow({
        width: 727,
        height: 509,
        show: true,
        webPreferences: {
          nodeIntegration: true,
        },
      });
      integrationTokenWin.loadURL(
        path.join("file://", __dirname, "/integrationToken.html")
      );
      integrationTokenWin.on("closed", () => {
        integrationTokenWin = null;
      });
    }
  });

  ipcMain.on("save_userDetails", (e, data) => {
    store.set("userDetails", data);
    mainWindow.webContents.send("open_import_dialogue", data);
    integrationTokenWin && integrationTokenWin.close();
  });
  ipcMain.on("reset_token", (e, data) => {
    store.set("userDetails", null);
  });
}

function showUpdateMessage(message){
  dialog.showMessageBox(mainWindow, {
    title: 'Update  status',
    buttons: ['OK'],
    type: 'warning',
    message,
   });
}