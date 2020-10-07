const { app } = require("electron");
const os = require("os");
const { log } = require("../common/activity");
const { checkForUpdates } = require("./system/updater");
const { showMainWindow, getMainWindow } = require("./windows/main-window");
const { showSetupWindow } = require("./windows/setup-window");
const { signinMain } = require("../common/signin");
const { defaultStore } = require("../common/store");
const debug = /--debug/.test(process.argv[2]);

defaultStore.set("debug", debug);
defaultStore.set("appVersion", app.getVersion());

if (process.mas) app.setName("Desk for Medium.com");

app.on("ready", () => {
  log("main-process/app/ready", {
    appVersion: app.getVersion(),
    osPlatform: os.platform(),
    osRelease: os.release(),
  });

  if (!debug) {
    checkForUpdates();
  }

  if (!defaultStore.get("setupComplete")) {
    showSetupWindow();
  } else {
    signinMain().then(() => {
      showMainWindow();
    });
  }
});

app.on("activate", () => {
  log("main-process/app/activate");

  if (!debug) {
    checkForUpdates();
  }

  if (!defaultStore.get("setupComplete")) {
    showSetupWindow();
  } else {
    signinMain().then(() => {
      showMainWindow();
    });
  }
});

app.on("session-created", (session) => {
  const userAgent = session.getUserAgent();
  session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ""));
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
