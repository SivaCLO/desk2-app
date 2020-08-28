const Remote = require("electron").remote;
const path = require("path");

class MediumView {
  constructor(tab, tabs) {
    this.tab = tab;
    this.tabs = tabs;

    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "./custom.js"),
      },
    });
    this.browserView.webContents.loadURL("https://medium.com/me/stories/drafts");

    this.browserView.webContents.on("will-navigate", (e, url) => {
      const fromURL = this.browserView.webContents.getURL();
      const { newTab, checkAndActivateTab } = require("../tabs/tabs");
      if (url.startsWith("https://medium.com/new-story")) {
        newTab(url, () => this.browserView.webContents.loadURL(fromURL));
      } else if (url.startsWith("https://medium.com/p") && url.includes("/edit")) {
        if (checkAndActivateTab(url)) {
          this.browserView.webContents.loadURL(fromURL);
        } else {
          newTab(url, () => this.browserView.webContents.loadURL(fromURL));
        }
      }
    });

    this.browserView.webContents.on("dom-ready", (e) => {
      this.browserView.webContents.insertCSS("button:focus {outline:0 !important}");
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      Remote.shell.openExternal(url);
    });

    this.browserView.webContents.on("page-title-updated", (e, title) => {
      this.tab.setTitle(title);
    });
  }
}

module.exports = MediumView;
