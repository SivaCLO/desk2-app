const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const { log } = require("../../common/activity");
const { visit } = require("../../common/page");
const { updateDraft } = require("../../common/desk");
const path = require("path");

class DeskTab {
  constructor(url, tab, tabs) {
    this.url = url;
    this.tab = tab;
    this.tabs = tabs;
    this.isStart = true;
    this.isNew = false;
    this.draftId = null;

    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        spellcheck: false,
        preload: path.join(__dirname, "desk-tab-preload.js"),
      },
    });

    this.handleNavigation();
    this.browserView.webContents.loadURL(url).then();
    this.browserView.webContents.on("did-navigate", () => {
      if (this.url !== this.browserView.webContents.getURL()) {
        this.url = this.browserView.webContents.getURL();
        this.handleNavigation();
      }
    });
    this.browserView.webContents.on("did-navigate-in-page", () => {
      if (this.url !== this.browserView.webContents.getURL()) {
        this.url = this.browserView.webContents.getURL();
        this.handleNavigation();
      }
    });

    this.browserView.webContents.on("dom-ready", (e) => {
      this.browserView.webContents.insertCSS("button:focus {outline:0 !important}");
    });

    this.browserView.webContents.on("page-title-updated", (e, title) => {
      if (title) {
        title = title.replace(/ – Medium/, "");
        title = title.replace(/^Editing /, "");
        title = title.replace(/^untitled story/, "Untitled");
      }
      this.tab.setTitle(title);
    });

    this.browserView.webContents.on("context-menu", (event, params) => {
      ipcRenderer.send("show-context-menu", params.x, params.y, params.selectionText, params.linkURL);
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      log("desk-tab/new-window", { url, fromURL: this.browserView.webContents.getURL(), tab: this.tab.id });
      e.preventDefault();
      const { newTab } = require("./tabs");
      newTab(url);
    });
  }

  handleNavigation = () => {
    visit(this.url, this.tab.id);

    this.isStart = this.url.startsWith("file:") && this.url.endsWith("start.html");
    this.draftId = this.url.split("?")[0].endsWith("/edit") ? this.url.split("/")[4] : null;
    this.isNew = this.url.split("?")[0].endsWith("/new-story");

    this.activateTab();

    this.tab.setIcon(
      null,
      null,
      this.isNew || this.draftId
        ? `<use xlink:href="../../node_modules/bootstrap-icons/bootstrap-icons.svg#pencil-square"/>`
        : null
    );

    ipcRenderer.send("save-tab", {
      id: this.tab.id,
      url: this.url,
    });
  };

  activateTab = async () => {
    if (this.tabs.getActiveTab() && this.tab.id === this.tabs.getActiveTab().id) {
      if (this.isStart) {
        document.getElementById("desk-tools").classList.add("active");
        document.getElementById("draft-tools").classList.remove("active");
        document.getElementById("medium-tools").classList.remove("active");
      } else if (this.draftId) {
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

      if (this.draftId) {
        let data = await updateDraft(this.draftId, this.url.split("?")[0]);
        if (data && data.payload && data.payload.value) {
          let title = data.payload.value.title || "Untitled";
          this.tab.setTitle(title);
        }
      }
    }
  };
}

module.exports = DeskTab;