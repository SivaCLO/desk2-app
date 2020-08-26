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
      if (
        url.startsWith("https://medium.com/new-story") ||
        (url.startsWith("https://medium.com/p") && url.includes("/edit"))
      ) {
        if (url.startsWith("https://medium.com/new-story")) {
          require("../tabs/tabs").newTab(url, () => this.browserView.webContents.loadURL(fromURL));
        } else {
          if (require("../tabs/tabs").checkAndActivateTab(url)) {
            this.browserView.webContents.loadURL(fromURL);
          } else {
            require("../tabs/tabs").newTab(url, () => this.browserView.webContents.loadURL(fromURL));
          }
        }
      } else {
        if (url === "https://medium.com/me/stories/drafts") {
          document.getElementById("medium-action-home").disabled = true;
          document.getElementById("medium-action-goback").disabled = true;
          document.getElementById("medium-action-goforward").disabled = false;
        } else {
          document.getElementById("medium-action-home").disabled = false;
          document.getElementById("medium-action-goback").disabled = false;
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
