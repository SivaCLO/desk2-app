const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { log } = require("../../common/activity");
const { getMainWindow } = require("./main-window");
const os = require("os");

let giphyWindow = null;

function showGiphyWindow() {
  if (!giphyWindow) {
    log("giphy-window/show");
    giphyWindow = new BrowserWindow({
      width: 250,
      height: 700,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      modal: true,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    giphyWindow.loadURL("file://" + path.join(__dirname, "../../render-process/giphy/giphy.html")).then();
    giphyWindow.on("closed", () => {
      giphyWindow = null;
    });
  }
}

function closeGiphyWindow() {
  log("giphy-window/close");
  giphyWindow.close();
  giphyWindow = null;
}

ipcMain.on("open-giphy-window", () => {
  showGiphyWindow();
});

ipcMain.on("close-giphy-window", () => {
  closeGiphyWindow();
});

ipcMain.on("insertGif", (event, data) => {
  getMainWindow().getBrowserView().webContents.send("insertGif-into-draft", data);
});

module.exports = { showGiphyWindow };
