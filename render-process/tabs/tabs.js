const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");

const Tabs = new TabGroup({
  newTab: {
    title: "Loading...",
    visible: true,
    active: true,
    viewType: "draft",
  },
});

Tabs.addTab({
  title: "",
  iconURL: "assets/app-icon/png/512.png",
  visible: true,
  active: true,
  viewType: "medium",
  closable: false,
});

function newTab(url, ready) {
  if(navigator.onLine){
      Tabs.addTab({
        title: "Loading...",
        visible: true,
        active: true,
        viewType: "draft",
        url: url,
        ready: ready,
      });
  }
}

ipcRenderer.on("new_tab", (event, url) => {
  newTab(url);
});

ipcRenderer.on('restore_tabs',(event, tabs) =>{
  tabs.map(tab=>{
    newTab(tab.url)
  })
})

function checkTabExists(url){
  let tabAvailable = null
  Tabs.getTabs().map(tempTab=>{
    if(url.includes(tempTab.view.browserView.webContents.getURL())){
      tabAvailable = tempTab
    }
  })
  if(tabAvailable){
    Tabs.getTab(tabAvailable.id).activate();
    return true;
  } else{
    return false;
  }
}
module.exports = { newTab, checkTabExists, Tabs };
