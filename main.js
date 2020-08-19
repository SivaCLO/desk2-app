const debug = /--debug/.test(process.argv[2]);

const path = require("path");
const glob = require("glob");
const { app, session, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

if (process.mas) app.setName("MediumDesk");

// Load Main Process
const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
files.forEach((file) => {
  require(file);
});

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders[
      "User-Agent"
    ] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  autoUpdater.checkForUpdates();
});

autoUpdater.logger = require("electron-log");

autoUpdater.on("checking-for-update", () => {
  showUpdateMessage("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  showUpdateMessage("Update available.");
});

autoUpdater.on("update-not-available", (info) => {
  showUpdateMessage("Update not available.");
});

autoUpdater.on("error", (err) => {
  showUpdateMessage("Error in auto-updater. " + err);
});

autoUpdater.on("update-downloaded", (info) => {
  showUpdateMessage("Update downloaded");
});

function showUpdateMessage(message) {
  dialog.showMessageBox(mainWindow, {
    title: "Update  status",
    buttons: ["OK"],
    type: "warning",
    message,
  });
}
