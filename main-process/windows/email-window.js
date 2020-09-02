const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");

let emailSignInWindow = null;

function openEmailSignInWindow() {
  emailSignInWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  emailSignInWindow.loadURL(path.join("file://", __dirname, "../../render-process/email-signin/email-signin.html"));
}

ipcMain.on("close-email-signin-window", (e, url) => {
  emailSignInWindow.close();
});

module.exports = { openEmailSignInWindow };
