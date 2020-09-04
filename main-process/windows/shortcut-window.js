const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

let shortcutWindow = null;

function openShortcutWindow() {
  if(shortcutWindow){
    shortcutWindow.close();
  }else{
    shortcutWindow = new BrowserWindow({
      width: 700,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    shortcutWindow.loadURL(path.join("file://", __dirname, "../../render-process/shortcut-keys/shortcut-keys.html"));
    shortcutWindow.on("closed", () => {
      shortcutWindow = null;
    });
  }
}

ipcMain.on("close-shortcut-window", (e, url) => {
  shortcutWindow.close();
});

module.exports = { openShortcutWindow };
