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
        spellcheck: false,
      },
    });

    this.browserView.webContents.loadURL(url || "https://medium.com/new-story");

    this.browserView.webContents.on("did-finish-load", () => {
      this.browserView.webContents.executeJavaScript(
        'if(document.getElementsByClassName("js-metabarLogoLeft").length > 0) document.getElementsByClassName("js-metabarLogoLeft").item(0).style.display="none";' +
          'if(document.getElementsByClassName("buttonSet buttonSet--wide").length > 0) document.getElementsByClassName("buttonSet buttonSet--wide").item(0).style.display="none";' +
          'if(document.getElementsByClassName("js-doneButton").length > 0) document.getElementsByClassName("js-doneButton").item(0).style.display="none";'
      );
    });

    this.browserView.webContents.on("will-navigate", (e, url) => {
      const fromURL = this.browserView.webContents.getURL();
      Remote.shell.openExternal(url);
      if (url.includes("postPublishedType")) {
        this.tabs.getActiveTab().close();
        this.tabs.getTab(0).activate();
        this.tabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/public");
      } else {
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
