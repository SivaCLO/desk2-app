const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");
const os = require("os");

let emailWindow = null;

function showEmailWindow() {
  log("email-window/show");
  if (!emailWindow) {
    emailWindow = new BrowserWindow({
      width: 600,
      height: 300,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    emailWindow.loadURL(path.join("file://", __dirname, "../../render-process/email/email.html")).then();
    emailWindow.on("closed", () => {
      emailWindow = null;
    });
  }
}

ipcMain.on("email-submit", (e, url) => {
  log("email-window/submit");
  if (getMainWindow()) {
    getMainWindow().webContents.send("load-medium-link", url);
  }
});

ipcMain.on("email-close", () => {
  log("email-window/close");
  emailWindow.close();
  emailWindow = null;
});

module.exports = { showEmailWindow };
