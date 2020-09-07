const { app, BrowserWindow, ipcMain } = require("electron");
const { defaultStore } = require("../../common/store");
const path = require("path");
const Config = require("../../config");
const { log } = require("../../common/activity");

let mainWindow = null;

function getMainWindow() {
  return mainWindow;
}

function showMainWindow() {
  if (!mainWindow) {
    if (!defaultStore.get("mediumdesk-user")) return;
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
      titleBarStyle: "hiddenInset",
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
      },
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join("file://", __dirname, "../../render-process/index.html"));
    mainWindow.on("resize", () => {
      resizeWindow();
    });
    mainWindow.on("maximize", () => {
      resizeWindow();
      resetTabPadding();
    });
    mainWindow.on("minimize", () => {
      resizeWindow();
      resetTabPadding();
    });
    mainWindow.on("enter-full-screen", () => {
      resizeWindow();
      resetTabPadding();
    });
    mainWindow.on("leave-full-screen", () => {
      resizeWindow();
      resetTabPadding();
    });
    mainWindow.on("unmaximize", () => {
      resizeWindow();
      resetTabPadding();
    });

    function resizeWindow() {
      log("main-window/resize");
      mainWindow.getBrowserView() &&
        mainWindow.getBrowserView().setBounds({
          x: 0,
          y: 82,
          width: mainWindow.getContentBounds().width,
          height: mainWindow.getContentBounds().height - 80,
        });
    }

    function resetTabPadding() {
      mainWindow.webContents.send("tab-padding", process.platform === "darwin" && !mainWindow.isFullScreen());
    }

    mainWindow.on("close", () => {
      if (!mainWindow.fullScreen) {
        defaultStore.set("lastWindowState", mainWindow.getBounds());
      }
      log("app/close");
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
      log("app/closed");
    });

    mainWindow.webContents.on("did-finish-load", () => {
      resetTabPadding();
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
  log("app/save-tab");
  let tempTabs = defaultStore.get("tabs");
  if (tempTabs && tempTabs.length > 0) {
    updateTabs(tab);
  } else {
    defaultStore.set("tabs", [tab]);
  }
});

ipcMain.on("delete-tab", (e, tabs) => {
  log("app/delete-tab");
  let tempTabs = defaultStore.get("tabs");
  let filteredTabs = tempTabs.filter((t) => t.id !== tabs.id);
  defaultStore.set("tabs", filteredTabs);
});

function updateTabs(tab) {
  log("app/update-tab");
  let tempTabs = defaultStore.get("tabs");
  let filteredTabs = tempTabs.filter((t) => t.id !== tab.id);
  defaultStore.set("tabs", [...filteredTabs, tab]);
}

module.exports = { showMainWindow, getMainWindow };
