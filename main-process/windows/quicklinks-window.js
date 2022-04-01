const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");
const os = require("os");

let quicklinksWindow = null;

function showQuicklinksWindow() {
  if (!quicklinksWindow) {
    log("quicklinks-window/show");
    quicklinksWindow = new BrowserWindow({
      width: 200,
      height: 264,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    quicklinksWindow
      .loadURL("file://" + path.join(__dirname, "../../render-process/quicklinks/quicklinks.html"))
      .then();
    quicklinksWindow.on("closed", () => {
      quicklinksWindow = null;
    });
  }
}

function closeQuicklinksWindow() {
  log("quicklinks-window/close");
  quicklinksWindow.close();
  quicklinksWindow = null;
}

ipcMain.on("open-quicklink", (e, url) => {
  log("quicklinks-window/open-quicklink");
  if (getMainWindow()) {
    getMainWindow().webContents.send("load-medium-link", url);
  }
});

ipcMain.on("open-quicklinks-window", () => {
  showQuicklinksWindow();
});

ipcMain.on("close-quicklinks-window", () => {
  closeQuicklinksWindow();
});

module.exports = { showQuicklinksWindow };
