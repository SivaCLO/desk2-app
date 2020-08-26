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

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL(path.join("file://", __dirname, "../../index.html"));
  mainWindow.on("resize", () => {
    resizeWindow();
  });
  mainWindow.on("maximize", () => {
    resizeWindow();
  });
  mainWindow.on("minimize", () => {
    resizeWindow();
  });
  mainWindow.on("enter-full-screen", () => {
    resizeWindow();
  });
  mainWindow.on("leave-full-screen", () => {
    resizeWindow();
  });
  mainWindow.on("unmaximize", () => {
    resizeWindow();
  });
  function resizeWindow() {
    mainWindow.getBrowserView() &&
      mainWindow.getBrowserView().setBounds({
        x: 0,
        y: 80,
        width: mainWindow.getContentBounds().width,
        height: mainWindow.getContentBounds().height - 80,
      });
  }

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

  mainWindow.webContents.once("did-finish-load", () => {
    let tempTabs = defaultStore.get("tabs");
    if (tempTabs && tempTabs.length > 0) {
      mainWindow.webContents.send("restore_tabs", tempTabs);
      defaultStore.set("tabs", []);
      tempTabs = null;
    }
  });

  ipcMain.on("save-tab", (e, tab) => {
    let tempTabs = defaultStore.get("tabs");
    if (tempTabs && tempTabs.length > 0) {
      updateTabs(tab);
    } else {
      defaultStore.set("tabs", [tab]);
    }
  });

  ipcMain.on("delete-tab", (e, tabs) => {
    let tempTabs = defaultStore.get("tabs");
    let filteredTabs = tempTabs.filter((t) => t.id !== tabs.id);
    defaultStore.set("tabs", filteredTabs);
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

function updateTabs(tab) {
  let tempTabs = defaultStore.get("tabs");
  let filteredTabs = tempTabs.filter((t) => t.id !== tab.id);
  defaultStore.set("tabs", [...filteredTabs, tab]);
}
