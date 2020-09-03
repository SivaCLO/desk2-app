const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { defaultStore } = require("../../common/store");
const path = require("path");
const Config = require("../../config");
const { log } = require("../../common/activity");

let mainWindow = null;

var isWin = process.platform === "win32";
var isMac = process.platform === "darwin";
var isLinux = process.platform === "linux";
let platform = isWin === true ? "isWin" : isMac === true ? "isMac" : isLinux === true ? "isLinux" : null;

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
      titleBarStyle: "hidden",
      webPreferences: {
        nodeIntegration: true,
      },
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join("file://", __dirname, "../../render-process/index.html"));
    // mainWindow.on("resize", () => {
    //   resizeWindow();
    // });
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
      let windowStatus = mainWindow.isFullScreen();
      let data = { windowStatus, platform };
      mainWindow.webContents.send("window-styling", data);
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

    mainWindow.webContents.once("did-finish-load", () => {
      let tempTabs = defaultStore.get("tabs");
      if (tempTabs && tempTabs.length > 0) {
        mainWindow.webContents.send("restore_tabs", tempTabs);
        defaultStore.set("tabs", []);
        tempTabs = null;
      }

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
              if (response.response === 2) {
                app.quit();
              }
              if (response.response === 1) {
                mainWindow.getBrowserView().webContents.reload();
              }
            })
            .catch((err) => {
              console.error(err);
            });
        }
      });
    });

    ipcMain.on("load-url-medium-view", (e, url) => {
      mainWindow.getBrowserView().webContents.loadURL(url).then();
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

function updateTabs(tab) {
  let tempTabs = defaultStore.get("tabs");
  let filteredTabs = tempTabs.filter((t) => t.id !== tab.id);
  defaultStore.set("tabs", [...filteredTabs, tab]);
}

module.exports = { showMainWindow, getMainWindow };
