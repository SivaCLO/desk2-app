const { app } = require("electron");
const os = require("os");
const { log } = require("../common/activity");
const { checkForUpdates } = require("./system/updater");
const { showMainWindow, getMainWindow } = require("./windows/main-window");
const { showSetupWindow } = require("./windows/setup-window");
const { signinMain } = require("../common/signin");
const { defaultStore } = require("../common/store");
const { getFlag } = require("../common/desk");
const debug = /--debug/.test(process.argv[2]);
const macAddress = require("node-macaddress");

defaultStore.set("debug", debug);
defaultStore.set("deskVersion", app.getVersion());

macAddress.one(function (err, address) {
  macAddress && defaultStore.set("macAddress", address);
});

if (process.mas) app.setName("Desk for Medium.com");

app.on("ready", () => {
  log("main-process/app/ready", {
    deskVersion: app.getVersion(),
    osPlatform: os.platform(),
    osRelease: os.release(),
    macAddress: defaultStore.get("macAddress"),
    debug,
  });

  if (!debug) {
    checkForUpdates();
  }

  if (!getFlag("setupCompleted")) {
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

  if (!getFlag("setupCompleted")) {
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
  app.quit();
});
