const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");

let emailWindow = null;

function showEmailWindow() {
  log("email-window/show");
  if (!emailWindow) {
    emailWindow = new BrowserWindow({
      width: 600,
      height: 300,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
      },
    });
    emailWindow.loadURL(path.join("file://", __dirname, "../../render-process/email/email.html")).then();
    emailWindow.on("closed", () => {
      emailWindow = null;
    });
  }
}

ipcMain.on("email-submit", (e, url) => {
  if (getMainWindow()) {
    getMainWindow().getBrowserView().webContents.loadURL(url).then();
  }
});

ipcMain.on("email-close", (e, url) => {
  log("email-window/close");
  emailWindow.close();
});

module.exports = { showEmailWindow };
