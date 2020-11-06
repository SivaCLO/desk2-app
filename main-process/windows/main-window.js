const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const { defaultStore } = require("../../common/store");
const path = require("path");
const { log } = require("../../common/activity");
const uuid = require("uuid");

let mainWindow = null;

function getMainWindow() {
  return mainWindow;
}

function showMainWindow() {
  if (!mainWindow) {
    const mainWindowPosition = defaultStore.get("mainWindowPosition") || { width: 1140, height: 840 };
    log("main-window/show", { position: mainWindowPosition });
    const windowOptions = {
      x: mainWindowPosition.x,
      y: mainWindowPosition.y,
      width: mainWindowPosition.width,
      height: mainWindowPosition.height,
      minWidth: 850,
      minHeight: 500,
      title: app.name,
      titleBarStyle: "hiddenInset",
      frame: os.platform() === "linux",
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL("file://" + path.join(__dirname, "../../render-process/main/tabs.html"));
    mainWindow.on("resize", () => {
      resizeWindow();
    });
    mainWindow.on("maximize", () => {
      log("main-window/maximize");
      resizeWindow();
    });
    mainWindow.on("minimize", () => {
      log("main-window/minimize");
      resizeWindow();
    });
    mainWindow.on("enter-full-screen", () => {
      log("main-window/enter-full-screen");
      resizeWindow();
    });
    mainWindow.on("leave-full-screen", () => {
      log("main-window/leave-full-screen");
      resizeWindow();
    });
    mainWindow.on("unmaximize", () => {
      log("main-window/unmaximize");
      resizeWindow();
    });

    function resizeWindow() {
      mainWindow.getBrowserView() &&
        mainWindow.getBrowserView().setBounds({
          x: 0,
          y: 82,
          width: mainWindow.getContentBounds().width,
          height: mainWindow.getContentBounds().height - 80,
        });
      mainWindow.webContents.send("tab-padding", process.platform === "darwin" && !mainWindow.isFullScreen());
      mainWindow.webContents.send("resize-tabs");
    }

    mainWindow.on("close", () => {
      log("main-window/close");
      if (!mainWindow.fullScreen) {
        defaultStore.set("mainWindowPosition", mainWindow.getBounds());
      }
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    mainWindow.webContents.on("did-finish-load", () => {
      resizeWindow();
    });

    mainWindow.webContents.once("did-finish-load", () => {
      let sessionId = uuid.v4();
      defaultStore.set("sessionId", sessionId);
      log("main-window/new-session", { sessionId });
      let tempTabs = defaultStore.get("tabs");
      if (tempTabs && tempTabs.length > 0) {
        mainWindow.webContents.send("restore_tabs", tempTabs);
        defaultStore.set("tabs", []);
        tempTabs = null;
      } else {
        mainWindow.webContents.send("new_tab");
      }
    });
  }
}

function closeMainWindow() {
  mainWindow.close();
}

ipcMain.on("close-main-window", () => {
  closeMainWindow();
});

ipcMain.on("save-tab", (e, tab) => {
  let tempTabs = defaultStore.get("tabs");
  if (tempTabs && tempTabs.length > 0) {
    let tempTabs = defaultStore.get("tabs");
    let filteredTabs = tempTabs.filter((t) => t.id !== tab.id);
    defaultStore.set("tabs", [...filteredTabs, tab]);
  } else {
    defaultStore.set("tabs", [tab]);
  }
});

ipcMain.on("delete-tab", (e, tabs) => {
  let tempTabs = defaultStore.get("tabs");
  if (tempTabs) {
    let filteredTabs = tempTabs.filter((t) => t.id !== tabs.id);
    defaultStore.set("tabs", filteredTabs);
  }
});

ipcMain.on("insert-screenshot", (e, content) => {
  getMainWindow().getBrowserView().webContents.send("insert-screeshot-into-draft", { content });
});

module.exports = { showMainWindow, getMainWindow, closeMainWindow };
