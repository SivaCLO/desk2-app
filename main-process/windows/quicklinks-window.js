const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");

let quicklinksWindow = null;

function showQuicklinksWindow() {
  if (!quicklinksWindow) {
    log("quicklinks-window/show");
    quicklinksWindow = new BrowserWindow({
      width: 200,
      height: 265,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    quicklinksWindow.loadURL(path.join("file://", __dirname, "../../render-process/quicklinks/quicklinks.html")).then();
    quicklinksWindow.on("closed", () => {
      quicklinksWindow = null;
    });
  }
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
  log("quicklinks-window/close");
  quicklinksWindow.close();
  quicklinksWindow = null;
});

module.exports = { showQuicklinksWindow };
