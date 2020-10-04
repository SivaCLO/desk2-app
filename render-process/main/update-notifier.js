const { ipcRenderer } = require("electron");
const { defaultStore } = require("../../common/store");
const compareVersion = require("semver-compare");

const notifyUpdate = () => {
  if (
    defaultStore.get("app-version") &&
    defaultStore.get("update-downloaded") &&
    compareVersion(defaultStore.get("update-downloaded"), defaultStore.get("app-version")) === 1
  ) {
    document.getElementById("update-notifier").hidden = false;
    document.getElementById("medium-tools-title").hidden = true;
    document.getElementById("draft-tools-title").hidden = true;
  }
};

document.getElementById("update-notifier").addEventListener("click", () => {
  ipcRenderer.send("restart-update");
});

notifyUpdate();

ipcRenderer.on("notify-update", () => {
  notifyUpdate();
});
