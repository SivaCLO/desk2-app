const { app, BrowserWindow, ipcMain } = require("electron");
const { defaultStore } = require("../../common/electron-store/store");
const path = require("path");
const Config = require("../../config");
const { log } = require("../system/activity");

let mainWindow = null;

function showMainWindow() {
  const mediumdeskUser = defaultStore.get("mediumdesk-user");
  if (!mediumdeskUser) return;
  if (!mainWindow) {
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
  }
}

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

function updateTabs(tab) {
  let tempTabs = defaultStore.get("tabs");
  let filteredTabs = tempTabs.filter((t) => t.id !== tab.id);
  defaultStore.set("tabs", [...filteredTabs, tab]);
}

module.exports = { showMainWindow, mainWindow };
