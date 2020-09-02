const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { defaultStore } = require("../../common/electron-store/store");
const path = require("path");
const Config = require("../../config");
const { autoUpdater } = require("electron-updater");
const { log } = require("../system/activity");

let mainWindow = null;

const debug = /--debug/.test(process.argv[2]);

function showMainWindow() {
  const mediumdeskUser = defaultStore.get("mediumdesk-user");
  if (!mediumdeskUser) return;

  log("main-window/show");

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
    log("app/close");
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

  ipcMain.on("log", (e, activityCode, activityData) => {
    log(activityCode, activityData);
  });
}

app.on("ready", () => {
  showMainWindow();
  if (!debug) {
    autoUpdater.checkForUpdates();
  }

  mainWindow.webContents.once("dom-ready", () => {
    ipcMain.on("network-status", (event, data) => {
      if (data === "offline") {
        const options = {
          type: "question",
          buttons: ["Cancel", "Refresh", "Quit"],
          defaultId: 2,
          title: "Question",
          message: "Please check your internet connection",
          detail: "Your network status is offline",
        };

        dialog
          .showMessageBox(null, options)
          .then((response) => {
            console.log("response", response);
            if (response.response === 2) {
              app.quit();
            }
            if (response.response === 1) {
              mainWindow.getBrowserView().webContents.reload();
            }
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    });
  });
  log("app/open");
});

app.on("activate", () => {
  if (mainWindow === null) {
    showMainWindow();
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
  log("app/update/error", err);
});

autoUpdater.on("update-downloaded", (info) => {
  showUpdateMessage("Update downloaded");
  log("app/update/downloaded", info);
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
