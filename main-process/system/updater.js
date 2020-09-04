const { autoUpdater } = require("electron-updater");
const { log } = require("../../common/activity");
autoUpdater.logger = require("electron-log");

function checkForUpdates() {
  autoUpdater.checkForUpdates().then();
}

autoUpdater.on("checking-for-update", () => {
  log("app/update/check");
});

autoUpdater.on("update-available", () => {
  log("app/update/available");
});

autoUpdater.on("error", (err) => {
  log("app/update/error", err);
});

autoUpdater.on("update-downloaded", (info) => {
  log("app/update/downloaded", info);
});

module.exports = { checkForUpdates };
