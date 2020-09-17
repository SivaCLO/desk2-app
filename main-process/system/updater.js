const { autoUpdater } = require("electron-updater");
const { log } = require("../../common/activity");
autoUpdater.logger = require("electron-log");

function checkForUpdates() {
  autoUpdater.checkForUpdates().then();
}

autoUpdater.on("checking-for-update", () => {
  log("updater/checking-for-update");
});

autoUpdater.on("update-available", () => {
  log("updater/update-available");
});

autoUpdater.on("error", (err) => {
  log("updater/error", err);
});

autoUpdater.on("update-downloaded", (info) => {
  log("updater/update-downloaded", { version: info.version, downloadedFile: info.downloadedFile });
});

module.exports = { checkForUpdates };
