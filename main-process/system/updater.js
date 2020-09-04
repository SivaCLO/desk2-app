const { autoUpdater } = require("electron-updater");
const { log } = require("../../common/activity");
autoUpdater.logger = require("electron-log");

function checkForUpdates() {
  autoUpdater.checkForUpdates().then();
}

autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update");
  log("app/update/check");
});

autoUpdater.on("update-available", () => {
  console.log("Update available");
  log("app/update/available");
});

autoUpdater.on("error", (err) => {
  console.log("Error in updating app");
  log("app/update/error", err);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded", info);
  log("app/update/downloaded", info);
});

module.exports = { checkForUpdates };
