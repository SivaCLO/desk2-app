const { app, session, ipcMain } = require("electron");
const os = require("os");
const { log } = require("../common/activity");
const { checkForUpdates } = require("./system/updater");
const { showMainWindow, getMainWindow } = require("./windows/main-window");
const { showLoginWindow, login } = require("./windows/login-window");
const { defaultStore } = require("../common/store");
const debug = /--debug/.test(process.argv[2]);

if (process.mas) app.setName("Desk for Medium.com");

app.on("ready", () => {
  log("main-process/app/ready", { "app-version": app.getVersion(), os: os.platform() });

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
        checkForUpdates();
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
    if (getMainWindow()) {
      if (getMainWindow().isMinimized()) getMainWindow().restore();
      getMainWindow().focus();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
