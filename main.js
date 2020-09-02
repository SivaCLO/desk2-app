const path = require("path");
const glob = require("glob");
const { app, session, dialog } = require("electron");
const os = require("os");
const { log } = require("./main-process/system/activity");
const { showMainWindow, mainWindow } = require("./main-process/windows/main-window");
const { showLoginWindow, login } = require("./main-process/windows/login-window");
const { defaultStore } = require("./common/electron-store/store");
const { autoUpdater } = require("electron-updater");
const debug = /--debug/.test(process.argv[2]);

if (process.mas) app.setName("MediumDesk");

// Load Main Process
const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
files.forEach((file) => {
  require(file);
});

app.on("ready", () => {
  log("app/open", { "app-version": app.getVersion(), os: os.platform() });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  const mediumToken = defaultStore.get("medium-token");
  if (!mediumToken) {
    showLoginWindow();
  } else {
    login().then(() => {
      showMainWindow();
      if (!debug) {
        autoUpdater.checkForUpdates().then();
      }
    });
  }
});

app.on("activate", () => {
  login().then(() => {
    showMainWindow();
  });
});

if (!process.mas) {
  app.requestSingleInstanceLock();
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

autoUpdater.logger = require("electron-log");

autoUpdater.on("checking-for-update", () => {
  showUpdateMessage("Checking for update...");
});

autoUpdater.on("update-available", () => {
  showUpdateMessage("Update available.");
});

autoUpdater.on("update-not-available", () => {
  showUpdateMessage("Update not available.");
});

autoUpdater.on("error", (err) => {
  showUpdateMessage("Error in auto-updater. " + err);
  log("app/update/error", err);
});

autoUpdater.on("update-downloaded", (info) => {
  showUpdateMessage("Update downloaded");
  log("app/update/downloaded", info);
});

function showUpdateMessage(message) {
  dialog
    .showMessageBox(mainWindow, {
      title: "Update  status",
      buttons: ["OK"],
      type: "warning",
      message,
    })
    .then();
}
