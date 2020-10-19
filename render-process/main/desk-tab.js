const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const { log } = require("../../common/activity");
const { getDrafts, updateDraft } = require("../../common/desk");
const { callMediumPost } = require("../../common/undocumented");

class DeskTab {
  constructor(url, tab, tabs) {
    this.url = url;
    this.tab = tab;
    this.tabs = tabs;
    this.isDesk = true;
    this.isNew = false;
    this.draftId = null;

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
        title = title.replace(/^untitled story/, "Untitled");
      }
      this.tab.setTitle(title);
    });

    this.browserView.webContents.on("context-menu", (event, params) => {
      ipcRenderer.send("show-context-menu", params.x, params.y, params.selectionText, params.linkURL);
    });

    this.browserView.webContents.on("will-navigate", (e, url) => {
      if (this.draftId) {
        if (url.includes("postPublishedType") || url.includes("showDomainSetup=true")) {
          updateDraft(this.draftId, "publishedTime", Date.now()).then();
        }
      }
    });
  }

  handleNavigation = () => {
    this.isDesk = this.url.startsWith("file:");
    this.draftId = this.url.split("?")[0].endsWith("/edit") ? this.url.split("/")[4] : null;
    this.isNew = this.url.split("?")[0].endsWith("/new-story");

    console.log(this.draftId);

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

  activateTab = () => {
    if (this.draftId) {
      let drafts = getDrafts();
      drafts && drafts[this.draftId] && drafts[this.draftId]["openedTime"]
        ? updateDraft(this.draftId, "lastOpenedTime", Date.now()).then()
        : updateDraft(this.draftId, "openedTime", Date.now()).then();
      callMediumPost(this.url.split("?")[0]).then((data) => {
        if (data) {
          let title = data.payload.value.title || "Untitled";
          this.tab.setTitle(title);
        }
      });
    }

    if (this.isDesk) {
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
  };
}

module.exports = DeskTab;
