const Remote = require("electron").remote;
const path = require("path");

class DraftView {
  constructor(url) {
    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "./custom.js"),
      },
    });

    this.browserView.webContents.loadURL(url || "https://medium.com/new-story");

    this.browserView.webContents.on("will-navigate", (e, url) => {
      // const fromURL = this.browserView.webContents.getURL();
      // const mediumTab = this.tabGroup.getTab(0);
      // mediumTab.loadURL(url).then((r) => {
      //   mediumTab.activate();
      //   this.browserView.webContents.loadURL(fromURL);
      // });
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      Remote.shell.openExternal(url);
    });
  }
}

module.exports = DraftView;
