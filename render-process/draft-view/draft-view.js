const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const path = require("path");

class DraftView {
  constructor(url) {
    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "./custom.js"),
        nodeIntegration: true,
      },
    });

    this.browserView.webContents.loadURL(url || "https://medium.com/new-story");

    this.browserView.webContents.on("did-finish-load", () => {
      this.browserView.webContents.executeJavaScript(
        'document.getElementsByClassName("js-metabarLogoLeft").item(0).hidden=true;' +
          'document.getElementsByClassName("buttonSet buttonSet--wide").item(0).style.display="none";'
      );
    });

    this.browserView.webContents.on("will-navigate", (e, url) => {
      const fromURL = this.browserView.webContents.getURL();
      if (url.includes("postPublishedType")) {
        this.tabs.getActiveTab().close();
        this.tabs.getTab(0).activate();
        this.tabs.getTab(0).view.browserView.webContents.loadURL(url);
      } else {
        Remote.shell.openExternal(url);
        this.browserView.webContents.loadURL(fromURL);
      }
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      Remote.shell.openExternal(url);
    });
  }
}

module.exports = DraftView;
