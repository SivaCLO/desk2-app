const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");

let shortcutsWindow = null;

function toggleShortcutsWindow() {
  if (shortcutsWindow) {
    log("shortcuts-window/close");
    shortcutsWindow.close();
    shortcutsWindow = null;
  } else {
    log("shortcuts-window/open");
    shortcutsWindow = new BrowserWindow({
      width: 800,
      height: 400,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
      },
    });
    shortcutsWindow.loadURL(path.join("file://", __dirname, "../../render-process/shortcuts/shortcuts.html")).then();
    shortcutsWindow.on("closed", () => {
      shortcutsWindow = null;
    });
  }
}

ipcMain.on("close-shortcuts-window", () => {
  toggleShortcutsWindow();
});

module.exports = { toggleShortcutsWindow };
//
