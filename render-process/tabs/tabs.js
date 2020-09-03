const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const FindInPage = require("electron-find").FindInPage;
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
  iconURL: "../assets/app-icon/png/512.png",
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

ipcRenderer.on("new_tab", (event, url) => {
  newTab(url);
  exitZenMode();
});

ipcRenderer.on("restore_tabs", (event, tabs) => {
  tabs.map((tab) => {
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

ipcRenderer.on("on-find", (e, args) => {
  let findInPage = new FindInPage(Remote.getCurrentWindow().getBrowserView().webContents);
  findInPage.openFindWindow();
});

ipcRenderer.on("window-styling", (event, data) => {
  if (data.windowStatus || data.platfrom === "isWin")
    document.getElementById("tabs").classList.replace("etab-padding", "etab-padding-none");
  else document.getElementById("tabs").classList.replace("etab-padding-none", "etab-padding");
});

function enterZenMode() {
  if (ElectronTabs.getActiveTab().viewType !== "medium" && !zenMode) {
    Remote.getCurrentWindow().setFullScreen(true);
    document.getElementById("tabs").classList.remove("visible");
    document.getElementById("draft-tools").classList.remove("active");
    document.getElementById("zen-tools").classList.add("active");
    ipcRenderer.send("log", "click/toolbar/zen-mode");
    ipcRenderer.send("zen-mode-on");
    zenMode = true;
  }
}

function exitZenMode() {
  if (ElectronTabs.getActiveTab().viewType !== "medium" && zenMode) {
    Remote.getCurrentWindow().setFullScreen(false);
    document.getElementById("zen-tools").classList.remove("active");
    document.getElementById("draft-tools").classList.add("active");
    document.getElementById("tabs").classList.add("visible");
    ipcRenderer.send("log", "click/toolbar/exit-zen-mode");
    ipcRenderer.send("zen-mode-off");
    zenMode = false;
  }
}

module.exports = { ElectronTabs, newTab, checkAndActivateTab, enterZenMode, exitZenMode };
