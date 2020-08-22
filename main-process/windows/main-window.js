const { app, session, BrowserWindow, ipcMain, dialog } = require("electron");
const { defaultStore } = require("../electron-store/store");
const path = require("path");
const Config = require("../../config");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;

const debug = /--debug/.test(process.argv[2]);

function createMainWindow() {
  // Create Main Window
  const lastWindowState = defaultStore.get("lastWindowState") || Config.WINDOW_SIZE;
  const windowOptions = {
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 850,
    minHeight: 500,
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
  mainWindow.loadURL(path.join("file://", __dirname, "../../index.html"));
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
      defaultStore.set("lastWindowState", mainWindow.getBounds());
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("load-url-medium-view", (e, url) => {
    mainWindow.getBrowserView().webContents.loadURL(url);
  });
}

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  createMainWindow();
  if (!debug) {
    autoUpdater.checkForUpdates();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

if (!process.mas) {
  app.requestSingleInstanceLock();
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

autoUpdater.logger = require("electron-log");

autoUpdater.on("checking-for-update", () => {
  showUpdateMessage("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  showUpdateMessage("Update available.");
});

autoUpdater.on("update-not-available", (info) => {
  showUpdateMessage("Update not available.");
});

autoUpdater.on("error", (err) => {
  showUpdateMessage("Error in auto-updater. " + err);
});

autoUpdater.on("update-downloaded", (info) => {
  showUpdateMessage("Update downloaded");
});

function showUpdateMessage(message) {
  dialog.showMessageBox(mainWindow, {
    title: "Update  status",
    buttons: ["OK"],
    type: "warning",
    message,
  });
}
