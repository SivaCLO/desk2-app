const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");
const MediumView = require("../medium-view/medium-view");
const DraftView = require("../draft-view/draft-view");

const Tabs = new TabGroup({
  newTab: {
    title: "Untitled",
    visible: true,
    active: true,
    browserView: new DraftView().browserView,
  },
});
Tabs.addTab({
  title: "",
  iconURL: "assets/app-icon/png/512.png",
  visible: true,
  active: true,
  browserView: new MediumView().browserView,
  closable: false,
});

function newTab(url, ready) {
  Tabs.addTab({
    title: "Untitled",
    visible: true,
    active: true,
    browserView: new DraftView(url).browserView,
    ready: ready,
  });
}

ipcRenderer.on("new_tab", (event, url) => {
  newTab(url);
});

module.exports = { newTab };
