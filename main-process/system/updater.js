const { ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { log } = require("../../common/activity");
autoUpdater.logger = require("electron-log");
const { defaultStore } = require("../../common/store");
const { getMainWindow } = require("../windows/main-window");

function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify().then();
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
  defaultStore.set("updateDownloaded", info.version);
  getMainWindow().webContents.send("notify-update");
});

ipcMain.on("restart-update", () => {
  log("updater/quit-install", {
    appVersion: defaultStore.get("appVersion"),
    downloadedVersion: defaultStore.get("updateDownloaded"),
  });
  autoUpdater.quitAndInstall();
});

module.exports = { checkForUpdates };
