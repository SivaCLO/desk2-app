const Remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const { ElectronTabs, checkAndActivateTab, newTab } = require("../tabs/tabs");
const FindInPage = require('electron-find').FindInPage;
let zenMode= false;

ipcRenderer.on('on-find', (e, args) => {
  let findInPage = new FindInPage(Remote.getCurrentWindow().getBrowserView().webContents);
  findInPage.openFindWindow()
})

ipcRenderer.on('enter-zen-mode', (e, args) => {
  if(ElectronTabs.getActiveTab().viewType !== "medium"){
    enterZenMode();
  }
})

ipcRenderer.on('next-tab', (e, args) => {
  if(ElectronTabs.getNextTab()){
    ElectronTabs.getNextTab().activate()
  }
  if(zenMode){
    exitZenMode()
  }
})

ipcRenderer.on('previous-tab', (e, args) => {
  if(ElectronTabs.getPreviousTab()){
    ElectronTabs.getPreviousTab().activate()
  }
  if(zenMode){
    exitZenMode()
  }
})

ipcRenderer.on('close-tab', (e, args) => {
  if(ElectronTabs.getActiveTab().id !== 0){
    ElectronTabs.getActiveTab().close()
  }
  if(zenMode){
    exitZenMode()
  }
})

ipcRenderer.on('open-previously-closed-tab', (e, args) => {
  let url = ElectronTabs.closedTabs.pop()
  if(url && !checkAndActivateTab(url)){
    newTab(url)
  }
  if(zenMode){
    exitZenMode()
  }
})

document.addEventListener("keydown", event => {
  switch (event.key) {
      case "Escape":
        if(ElectronTabs.getActiveTab().viewType !== "medium" && zenMode){
          exitZenMode();
        }
          break;
       }
});



document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

var previousTitle;

document.body.addEventListener("mouseover", (event) => {
  if (event.target.dataset.tooltip) {
    if (ElectronTabs.getActiveTab().viewType === "medium") {
      let mediumToolsTitle = document.getElementById("medium-tools-title");
      if (!previousTitle) previousTitle = mediumToolsTitle.innerHTML;
      mediumToolsTitle.innerHTML = "<b>" + event.target.dataset.tooltip + "</b>";
    } else {
      let draftToolsTitle = document.getElementById("draft-tools-title");
      if (!previousTitle) previousTitle = draftToolsTitle.innerHTML;
      draftToolsTitle.innerHTML = "<b>" + event.target.dataset.tooltip + "</b>";
    }
  } else {
    ElectronTabs.getActiveTab().setTitle(ElectronTabs.getActiveTab().view.browserView.webContents.getTitle());
  }
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;

  // Medium Tools
  if (action === "home") {
    Remote.getCurrentWindow().getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`);
    ipcRenderer.send("log", "click/toolbar/home");
  } else if (action === "refresh") {
    Remote.getCurrentWindow().getBrowserView().webContents.reload();
    ipcRenderer.send("log", "click/toolbar/refresh");
  } else if (action === "back") {
    Remote.getCurrentWindow().getBrowserView().webContents.goBack();
    ipcRenderer.send("log", "click/toolbar/back");
  } else if (action === "forward") {
    Remote.getCurrentWindow().getBrowserView().webContents.goForward();
    ipcRenderer.send("log", "click/toolbar/forward");
  } else if (action === "import-draft") {
    ipcRenderer.send("open-import-draft-window");
    ipcRenderer.send("log", "click/toolbar/import-draft");
  } else if (action === "open-link") {
    Remote.shell.openExternal(Remote.getCurrentWindow().getBrowserView().webContents.getURL());
    ipcRenderer.send("log", "click/toolbar/open-link");
  }

  // Draft Tools
  else if (action === "backToDrafts") {
    ElectronTabs.getTab(0).activate();
    ElectronTabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/drafts");
  } else if (action === "zen-mode") {
    enterZenMode();
  } else if (action === "exit-zen-mode") {
    exitZenMode();
  }
}

function enterZenMode(){
  Remote.getCurrentWindow().setFullScreen(true);
  document.getElementById("tabs").classList.remove("visible");
  document.getElementById("draft-tools").classList.remove("active");
  document.getElementById("zen-tools").classList.add("active");
  ipcRenderer.send("log", "click/toolbar/zen-mode");
  ipcRenderer.send("zen-mode-on")
  zenMode= true;
}

function exitZenMode(){
  Remote.getCurrentWindow().setFullScreen(false);
  document.getElementById("zen-tools").classList.remove("active");
  document.getElementById("draft-tools").classList.add("active");
  document.getElementById("tabs").classList.add("visible");
  ipcRenderer.send("log", "click/toolbar/exit-zen-mode");
  ipcRenderer.send("zen-mode-off")
  zenMode= false
}
