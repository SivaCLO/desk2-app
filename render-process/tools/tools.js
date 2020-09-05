const Remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const { ElectronTabs, loadDrafts, enterZenMode, exitZenMode } = require("../tabs/tabs");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

let previousTitle;

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
    ipcRenderer.send("open-import-draft-dialog");
    ipcRenderer.send("log", "click/toolbar/import-draft");
  } else if (action === "open-link") {
    Remote.shell.openExternal(Remote.getCurrentWindow().getBrowserView().webContents.getURL());
    ipcRenderer.send("log", "click/toolbar/open-link");
  }

  // Draft Tools
  else if (action === "backToDrafts") {
    loadDrafts();
  } else if (action === "zen-mode") {
    enterZenMode();
  } else if (action === "exit-zen-mode") {
    exitZenMode();
  }
}
