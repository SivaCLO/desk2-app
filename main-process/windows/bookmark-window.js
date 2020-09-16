const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");

let bookmarkWindow = null;

function showBookmarkWindow() {
  log("bookmark-window/show");
  if (!bookmarkWindow) {
    bookmarkWindow = new BrowserWindow({
      width: 600,
      height: 400,
      frame: false,
      resizable: false,
    //   alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    bookmarkWindow.loadURL(path.join("file://", __dirname, "../../render-process/bookmark/bookmark.html")).then();
    bookmarkWindow.on("closed", () => {
      bookmarkWindow = null;
    });
  }
}

ipcMain.on("load-bookmark", (e, url) => {
  log("bookmark-window/load-bookmark");
  if (getMainWindow()) {
    getMainWindow().webContents.send("load-drafts", url);
  }
});

ipcMain.on("bookmark-close", () => {
  log("bookmark-window/close");
  bookmarkWindow.close();
  bookmarkWindow = null;
});

module.exports = { showBookmarkWindow };
