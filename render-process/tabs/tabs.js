const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const { log } = require("../../common/activity");
let zenMode = false;

const ElectronTabs = new TabGroup({
  newTab: {
    title: "Loading...",
    visible: true,
    active: true,
    viewType: "draft",
  },
});

ElectronTabs.addTab({
  title: "",
  iconURL: "../assets/img/medium-transparent.svg",
  visible: true,
  active: true,
  viewType: "medium",
  closable: false,
});

newTab = function (url, ready) {
  ElectronTabs.addTab({
    title: "Loading...",
    visible: true,
    active: true,
    viewType: "draft",
    url: url,
    ready: ready,
  });
};

checkAndActivateTab = function (url) {
  let tabAvailable = null;
  ElectronTabs.getTabs().map((tempTab) => {
    if (url.includes(tempTab.view.browserView.webContents.getURL())) {
      tabAvailable = tempTab;
    }
  });
  if (tabAvailable) {
    ElectronTabs.getTab(tabAvailable.id).activate();
    return true;
  } else {
    return false;
  }
};

loadDrafts = function (url) {
  ElectronTabs.getTab(0).activate();
  if(!url){
    ElectronTabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/drafts").then();
  }else{
    ElectronTabs.getTab(0).view.browserView.webContents.loadURL(url)
  }
};

ipcRenderer.on("load-drafts", (event, url) => {
  loadDrafts(url);
  exitZenMode();
});

ipcRenderer.on("new_tab", (event, url) => {
  newTab(url);
  exitZenMode();
});

ipcRenderer.on("restore_tabs", (event, tabs) => {
  let tempTabs = tabs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  tempTabs.map((tab) => {
    newTab(tab.url);
  });
});

ipcRenderer.on("enter-zen-mode", (e, args) => {
  enterZenMode();
});

ipcRenderer.on("exit-zen-mode", (e, args) => {
  exitZenMode();
});

ipcRenderer.on("next-tab", (e, args) => {
  ElectronTabs.getNextTab().activate();
  exitZenMode();
});

ipcRenderer.on("previous-tab", (e, args) => {
  ElectronTabs.getPreviousTab().activate();
  exitZenMode();
});

ipcRenderer.on("close-tab", (e, args) => {
  if (ElectronTabs.getActiveTab().id !== 0) {
    ElectronTabs.getActiveTab().close();
  }
  exitZenMode();
});

ipcRenderer.on("open-previously-closed-tab", (e, args) => {
  let url = ElectronTabs.closedTabs.pop();
  if (url && !checkAndActivateTab(url)) {
    newTab(url);
  }
  exitZenMode();
});


ipcRenderer.on("tab-padding", (event, on) => {
  if (on) document.getElementById("tabs").classList.add("etabs-padding");
  else document.getElementById("tabs").classList.remove("etabs-padding");
});

ipcRenderer.on("resize-tabs", () => {
  ElectronTabs.resizeTabs();
});

function enterZenMode() {
  if (ElectronTabs.getActiveTab().viewType !== "medium" && !zenMode) {
    log("tabs/zen-mode-on");
    Remote.getCurrentWindow().setFullScreen(true);
    document.getElementById("tabs").classList.remove("visible");
    document.getElementById("draft-tools").classList.remove("active");
    document.getElementById("zen-tools").classList.add("active");
    ipcRenderer.send("zen-mode-on");
    zenMode = true;
  }
}

function exitZenMode() {
  if (ElectronTabs.getActiveTab().viewType !== "medium" && zenMode) {
    log("tabs/zen-mode-off");
    Remote.getCurrentWindow().setFullScreen(false);
    document.getElementById("zen-tools").classList.remove("active");
    document.getElementById("draft-tools").classList.add("active");
    document.getElementById("tabs").classList.add("visible");
    ipcRenderer.send("zen-mode-off");
    zenMode = false;
  }
}

module.exports = { ElectronTabs, loadDrafts, newTab, checkAndActivateTab, enterZenMode, exitZenMode };
