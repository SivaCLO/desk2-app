const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../electron-store/store");

let networkStatusWindow = null;

function showNetworkStatusWindow() {
  networkStatusWindow = new BrowserWindow({
    width: 300,
    height: 200,
    show: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  networkStatusWindow
    .loadURL(path.join("file://", __dirname, "../../render-process/network-status/network-status.html"))
    .then();
  networkStatusWindow.on("closed", () => {
    networkStatusWindow = null;
  });
}

ipcMain.on("network-status", (event, data) => {
  data === "online"
    ? networkStatusWindow && networkStatusWindow.hide()
    : networkStatusWindow && networkStatusWindow.show();
});

module.exports = { showNetworkStatusWindow };
