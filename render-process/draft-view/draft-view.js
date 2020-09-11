const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const path = require("path");
const { log } = require("../../common/activity");

class DraftView {
  constructor(url, tab, tabs) {
    this.tab = tab;
    this.tabs = tabs;

    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
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

    this.browserView.webContents.on("did-start-loading", () => {
      hideMediumLogoAndAvatar(this.browserView);
    });

    this.browserView.webContents.on("did-finish-load", () => {
      hideMediumLogoAndAvatar(this.browserView);
    });

    this.browserView.webContents.on("will-navigate", (e, url) => {
      const fromURL = this.browserView.webContents.getURL();
      log("draft-view/will-navigate", { url, fromURL });
      Remote.shell.openExternal(url);
      if (url.includes("postPublishedType")) {
        log("draft-view/publish", { url, fromURL });
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
      log("draft-view/new-window", { url });
      e.preventDefault();
      Remote.shell.openExternal(url);
    });

    this.browserView.webContents.on("page-title-updated", (e, title) => {
      this.tab.setTitle(title);
    });

    this.browserView.webContents.on("did-navigate-in-page", (event) => {
      if (this.browserView.webContents.getURL().endsWith("/edit")) {
        log("draft-view/did-navigate-in-page", { url: this.browserView.webContents.getURL() });
        let toolTitle = document.getElementById("draft-tools-title");
        toolTitle.innerHTML = this.browserView.webContents.getURL();
        ipcRenderer.send("save-tab", {
          id: this.tab.id,
          url: this.browserView.webContents.getURL(),
        });
      }
    });
  }
}

function hideMediumLogoAndAvatar(browserView) {
  log("draft-view/hide-medium-links", { url: browserView.webContents.getURL() });
  browserView.webContents
    .executeJavaScript(
      'if(document.getElementsByClassName("js-metabarLogoLeft").length > 0) document.getElementsByClassName("js-metabarLogoLeft").item(0).style.display="none";' +
        'if(document.getElementsByClassName("buttonSet buttonSet--wide").length > 0) document.getElementsByClassName("buttonSet buttonSet--wide").item(0).style.display="none";' +
        'if(document.getElementsByClassName("js-doneButton").length > 0) document.getElementsByClassName("js-doneButton").item(0).style.display="none";' +
        'if(document.getElementsByClassName("u-flexCenter u-height65 u-xs-height56 u-marginRight18").length > 0) document.getElementsByClassName("u-flexCenter u-height65 u-xs-height56 u-marginRight18").item(0).innerHTML = "";' +
        'if(document.getElementsByClassName("u-inlineBlock u-height28 u-xs-height24 u-verticalAlignTop u-marginRight20 u-marginLeft15 u-borderRightLighter").length > 0) document.getElementsByClassName("u-inlineBlock u-height28 u-xs-height24 u-verticalAlignTop u-marginRight20 u-marginLeft15 u-borderRightLighter").item(0).classList.remove("u-height28");'
    )
    .then();
}

module.exports = DraftView;
