const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { defaultStore } = require("../../common/store");
const os = require("os");

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
      height: 655,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        spellcheck: false,
        enableRemoteModule: true,
      },
    };

    shortcutsWindow = new BrowserWindow(windowOptions);
    require("@electron/remote/main").enable(shortcutsWindow.webContents);
    shortcutsWindow.loadURL("file://" + path.join(__dirname, "../../render-process/shortcuts/shortcuts.html")).then();
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
