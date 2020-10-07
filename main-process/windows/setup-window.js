const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");
const { showMainWindow } = require("./main-window");
const os = require("os");
const fs = require("fs-extra");

let setupWindow = null;

function showSetupWindow(errorMessage) {
  log("setup-window/show");
  if (!setupWindow) {
    setupWindow = new BrowserWindow({
      width: 600,
      height: 800,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    setupWindow.loadURL(path.join("file://", __dirname, "../../render-process/setup/setup.html")).then(() => {
      loadValues(errorMessage);
    });
    setupWindow.on("closed", () => {
      setupWindow = null;
    });
  } else {
    loadValues(errorMessage);
  }
}

function loadValues(errorMessage) {
  let mediumToken = defaultStore.get("medium-token");
  if (mediumToken) {
    log("setup-window/existing-token", { mediumToken });
    setupWindow.webContents.send("login-token", mediumToken);
  }
  let userEmail = defaultStore.get("user-email");
  if (userEmail) {
    log("setup-window/existing-email", { userEmail });
    setupWindow.webContents.send("login-email", userEmail);
  }
  if (errorMessage) {
    log("setup-window/existing-error", { errorMessage });
    setupWindow.webContents.send("login-error", errorMessage);
  }
}

ipcMain.on("login-submit", (e, mediumToken, userEmail) => {
  log("setup-window/submit", { mediumToken, userEmail });
  login().then(() => {
    showMainWindow();
    close();
  });
});

ipcMain.on("login-close", () => {
  close();
});

function close() {
  log("setup-window/close");
  if (setupWindow) {
    setupWindow.close();
  }
}

function resetApp() {
  log("setup-window/reset-app");
  defaultStore.clear();
  const getAppPath = path.join(app.getPath("appData"), app.name);
  fs.unlink(getAppPath, () => {
    app.relaunch();
    app.exit(0);
  });
}

module.exports = { showSetupWindow, resetApp };
