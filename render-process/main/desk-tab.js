const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const { log } = require("../../common/activity");

class DeskTab {
  constructor(url, tab, tabs) {
    this.url = url;
    this.tab = tab;
    this.tabs = tabs;
    this.isDesk = true;
    this.isDraft = false;

    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        spellcheck: false,
      },
    });

    log("desk-tab/load-url", { url });
    this.handleNavigation();
    this.browserView.webContents.loadURL(url).then();
    this.browserView.webContents.on("did-navigate", () => {
      this.url = this.browserView.webContents.getURL();
      log("desk-tab/did-navigate", { url: this.url });
      this.handleNavigation();
    });
    this.browserView.webContents.on("did-navigate-in-page", () => {
      this.url = this.browserView.webContents.getURL();
      log("desk-tab/did-navigate-in-page", { url: this.url });
      this.handleNavigation();
    });

    this.browserView.webContents.on("dom-ready", (e) => {
      this.browserView.webContents.insertCSS("button:focus {outline:0 !important}");
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      log("desk-tab/new-window", { url, fromURL: this.browserView.webContents.getURL() });
      e.preventDefault();
      const { newTab } = require("./tabs");
      newTab(url);
    });

    this.browserView.webContents.on("page-title-updated", (e, title) => {
      if (title) {
        title = title.replace(/ – Medium/, "");
        title = title.replace(/^Editing /, "");
      }
      this.tab.setTitle(title);
    });
  }

  handleNavigation = () => {
    this.isDesk = this.url.startsWith("file:");
    this.isDraft = this.url.split("?")[0].endsWith("/edit") || this.url.split("?")[0].endsWith("/new-story");

    this.activateTools();

    ipcRenderer.send("save-tab", {
      id: this.tab.id,
      url: this.url,
    });
  };

  activateTools = () => {
    if (this.isDesk) {
      document.getElementById("desk-tools").classList.add("active");
      document.getElementById("draft-tools").classList.remove("active");
      document.getElementById("medium-tools").classList.remove("active");
    } else if (this.isDraft) {
      let toolTitle = document.getElementById("draft-tools-title");
      toolTitle.innerHTML = this.url.split("?")[0];
      document.getElementById("desk-tools").classList.remove("active");
      document.getElementById("draft-tools").classList.add("active");
      document.getElementById("medium-tools").classList.remove("active");
    } else {
      let toolTitle = document.getElementById("medium-tools-title");
      toolTitle.innerHTML = this.url.split("?")[0];
      document.getElementById("desk-tools").classList.remove("active");
      document.getElementById("draft-tools").classList.remove("active");
      document.getElementById("medium-tools").classList.add("active");
    }
  };
}

module.exports = DeskTab;
