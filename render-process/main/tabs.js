const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");
const Remote = require("electron").remote;
const { log } = require("../../common/activity");
const os = require("os");
const path = require("path");
let zenMode = false;

const ElectronTabs = new TabGroup({
  newTab: {
    title: "Loading...",
    visible: true,
    active: true,
    url: "file://" + path.join(__dirname, "start.html"),
  },
});

newTab = function (url, ready) {
  url = url || "file://" + path.join(__dirname, "start.html");

  ElectronTabs.addTab({
    title: "Loading...",
    visible: true,
    active: true,
    url,
    ready,
  });
};

ipcRenderer.on("new_tab", (event, url) => {
  exitZenMode();
  newTab(url);
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
  exitZenMode();
  ElectronTabs.getNextTab().activate();
});

ipcRenderer.on("previous-tab", (e, args) => {
  exitZenMode();
  ElectronTabs.getPreviousTab().activate();
});

ipcRenderer.on("close-tab", (e, args) => {
  exitZenMode();
  ElectronTabs.getActiveTab().close();
});

ipcRenderer.on("open-previously-closed-tab", (e, args) => {
  exitZenMode();
  let url = ElectronTabs.closedTabs.pop();
  url && newTab(url);
});

ipcRenderer.on("tab-padding", (event, on) => {
  if (on) document.getElementById("tabs").classList.add("etabs-padding");
  else document.getElementById("tabs").classList.remove("etabs-padding");
});

ipcRenderer.on("resize-tabs", () => {
  ElectronTabs.resizeTabs();
});

ipcRenderer.on("zoom-in", (e, args) => {
  zoomIn();
});

ipcRenderer.on("zoom-out", (e, args) => {
  zoomOut();
});

ipcRenderer.on("reset-zoom", (e, args) => {
  resetZoom();
});

function enterZenMode() {
  if (!zenMode) {
    log("tabs/zen-mode-on");
    Remote.getCurrentWindow().setFullScreen(true);
    document.getElementById("tabs").classList.remove("visible");
    document.getElementById("wincontrol").classList.remove("visible");
    document.getElementById("desk-tools").classList.remove("active");
    document.getElementById("draft-tools").classList.remove("active");
    document.getElementById("medium-tools").classList.remove("active");
    document.getElementById("zen-tools").classList.add("active");
    ipcRenderer.send("zen-mode-on");
    zenMode = true;
  }
}

function exitZenMode() {
  if (zenMode) {
    log("tabs/zen-mode-off");
    Remote.getCurrentWindow().setFullScreen(false);
    document.getElementById("zen-tools").classList.remove("active");
    ElectronTabs.getActiveTab().view.activateTab();
    if (os.platform() === "win32") {
      document.getElementById("wincontrol").classList.add("visible");
    }
    document.getElementById("tabs").classList.add("visible");
    ipcRenderer.send("zen-mode-off");
    zenMode = false;
  }
}

function zoomIn() {
  let webContents = Remote.getCurrentWindow().getBrowserView().webContents;
  const currentZoom = webContents.getZoomFactor();
  if (currentZoom < 2.0) webContents.zoomFactor = currentZoom + 0.2;
}

function zoomOut() {
  let webContents = Remote.getCurrentWindow().getBrowserView().webContents;
  const currentZoom = webContents.getZoomFactor();
  if (currentZoom > -2.0) webContents.zoomFactor = currentZoom - 0.2;
}

function resetZoom() {
  let webContents = Remote.getCurrentWindow().getBrowserView().webContents;
  webContents.setZoomFactor(1.0);
}

module.exports = {
  ElectronTabs,
  newTab,
  enterZenMode,
  exitZenMode,
  zoomOut,
  zoomIn,
  resetZoom,
};
