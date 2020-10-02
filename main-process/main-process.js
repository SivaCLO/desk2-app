const { app, session, ipcMain } = require("electron");
const os = require("os");
const { log } = require("../common/activity");
const { checkForUpdates } = require("./system/updater");
const { showMainWindow, getMainWindow } = require("./windows/main-window");
const { showLoginWindow, login } = require("./windows/login-window");
const { defaultStore } = require("../common/store");
const debug = /--debug/.test(process.argv[2]);

defaultStore.set("debug", debug);

if (process.mas) app.setName("Desk for Medium.com");

app.on("ready", () => {
  log("main-process/app/ready", {
    "app-version": app.getVersion(),
    "os-platform": os.platform(),
    "os-release": os.release(),
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  if (!debug) {
    checkForUpdates();
  }

  const mediumToken = defaultStore.get("medium-token");
  const userEmail = defaultStore.get("user-email");
  if (!mediumToken || !userEmail) {
    showLoginWindow();
  } else {
    login().then(() => {
      showMainWindow();
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
