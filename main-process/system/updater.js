const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");
const { log } = require("../../common/activity");

function checkForUpdates() {
  autoUpdater.checkForUpdates().then();
}

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
    .showMessageBox(null, {
      title: "Update  status",
      buttons: ["OK"],
      type: "warning",
      message,
    })
    .then();
}

module.exports = { checkForUpdates };
