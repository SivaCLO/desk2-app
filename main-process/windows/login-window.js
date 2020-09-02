const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../../common/electron-store/store");
const { log } = require("../system/activity");

let loginWindow;

app.on("ready", () => {
  const mediumdeskUser = defaultStore.get("mediumdesk-user");
  if (!mediumdeskUser) {
    showLoginWindow();
  }
});

function showLoginWindow() {
  log("login-window/show");
  loginWindow = new BrowserWindow({
    width: 727,
    height: 509,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  loginWindow.loadURL(path.join("file://", __dirname, "../../render-process/login/login.html")).then();
  loginWindow.on("closed", () => {
    loginWindow = null;
  });
}

ipcMain.on("save-user", (event, mediumToken, mediumUser, mediumdeskUser) => {
  log("login-window/save-user");
  defaultStore.set("medium-token", mediumToken);
  defaultStore.set("medium-user", mediumUser);
  defaultStore.set("mediumdesk-user", mediumdeskUser);
  app.relaunch();
  app.exit(0);
});

function logout() {
  log("login-window/logout");
  defaultStore.delete("medium-token");
  defaultStore.delete("medium-user");
  defaultStore.delete("mediumdesk-user");
  app.relaunch();
  app.exit(0);
}

module.exports = { showLoginWindow, logout };
