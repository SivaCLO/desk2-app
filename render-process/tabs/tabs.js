const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");

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
  iconURL: "assets/app-icon/png/512.png",
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
});

ipcRenderer.on("restore_tabs", (event, tabs) => {
  tabs.map((tab) => {
    newTab(tab.url);
  });
});

module.exports = { ElectronTabs, newTab, checkAndActivateTab };
