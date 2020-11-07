const { ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { log } = require("../../common/activity");
autoUpdater.logger = require("electron-log");
const { defaultStore } = require("../../common/store");

function checkForUpdates() {
  if (!defaultStore.get("downloadedVersion")) autoUpdater.checkForUpdatesAndNotify().then();
}

ipcMain.on("check-update", () => {
  checkForUpdates();
});

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
  if (info && info.version) {
    log("updater/update-downloaded", { version: info.version, downloadedFile: info.downloadedFile });
    defaultStore.set("downloadedVersion", info.version);
  }
});

ipcMain.on("restart-update", () => {
  log("updater/quit-install", {
    currentVersion: defaultStore.get("deskVersion"),
    downloadedVersion: defaultStore.get("downloadedVersion"),
  });
  setImmediate(() => {
    autoUpdater.quitAndInstall();
  });
});

module.exports = { checkForUpdates };
