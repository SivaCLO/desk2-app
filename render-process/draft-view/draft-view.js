const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const path = require("path");
const { logActivity } = require("../../main-process/system/activity");

class DraftView {
  constructor(url, tab, tabs) {
    this.tab = tab;
    this.tabs = tabs;

    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "./custom.js"),
        nodeIntegration: true,
        spellcheck: false,
      },
    });

    this.browserView.webContents.loadURL(url || "https://medium.com/new-story");

    if (url) {
      ipcRenderer.send("save-tab", {
        id: this.tab.id,
        url,
      });
    }

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
        this.tab.close();
        this.tabs.getTab(0).activate();
        this.tabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/public");
      } else {
        this.browserView.webContents.loadURL(fromURL);
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

    this.browserView.webContents.on("did-navigate-in-page", (event) => {
      if (this.browserView.webContents.getURL().endsWith("/edit")) {
        let toolTitle = document.getElementById("draft-tools-title");
        toolTitle.innerHTML = this.browserView.webContents.getURL();
        logActivity({
          userId: "abc",
          emailId: "test@mediumdesk.com",
          data: { message: "created/new-draft", info: { url: toolTitle.innerHTML } },
        });
        ipcRenderer.send("save-tab", {
          id: this.tab.id,
          url: this.browserView.webContents.getURL(),
        });
      }
    });
  }
}

module.exports = DraftView;
