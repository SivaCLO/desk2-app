const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { defaultStore } = require("../../common/store");

let shortcutsWindow = null;

function toggleShortcutsWindow() {
  if (shortcutsWindow) {
    log("shortcuts-window/close");
    shortcutsWindow.close();
    shortcutsWindow = null;
  } else {
    log("shortcuts-window/open");
    const shortcutsWindowPosition = defaultStore.get("shortcutsWindowPosition") || {};
    const windowOptions = {
      x: shortcutsWindowPosition.x,
      y: shortcutsWindowPosition.y,
      width: 350,
      height: 640,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    };

    shortcutsWindow = new BrowserWindow(windowOptions);
    shortcutsWindow.loadURL(path.join("file://", __dirname, "../../render-process/shortcuts/shortcuts.html")).then();
    shortcutsWindow.on("close", () => {
      defaultStore.set("shortcutsWindowPosition", shortcutsWindow.getBounds());
      log("shortcuts-window/close-button");
    });
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
