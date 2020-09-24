const Remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const { ElectronTabs, loadMediumLink, enterZenMode, exitZenMode, zoomIn, zoomOut, resetZoom } = require("./tabs");
const { log } = require("../../common/activity");

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
  if (action === "open-drafts") {
    log("tools/open-drafts");
    Remote.getCurrentWindow().getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`);
  } else if (action === "refresh") {
    log("tools/reload");
    Remote.getCurrentWindow().getBrowserView().webContents.reload();
  } else if (action === "back") {
    log("tools/back");
    Remote.getCurrentWindow().getBrowserView().webContents.goBack();
  } else if (action === "forward") {
    log("tools/forward");
    Remote.getCurrentWindow().getBrowserView().webContents.goForward();
  } else if (action === "import-draft") {
    log("tools/import-draft");
    ipcRenderer.send("open-import-draft-dialog");
  } else if (action === "open-link") {
    log("tools/open-link");
    Remote.shell.openExternal(Remote.getCurrentWindow().getBrowserView().webContents.getURL());
  } else if (action === "quicklinks") {
    log("tools/quicklinks");
    ipcRenderer.send("open-quicklinks-window");
  }

  // Draft Tools
  else if (action === "backToDrafts") {
    log("tools/back-to-drafts");
    loadMediumLink();
  } else if (action === "zen-mode") {
    log("tools/enter-zen-mode");
    enterZenMode();
  } else if (action === "exit-zen-mode") {
    log("tools/exit-zen-mode");
    exitZenMode();
  } else if (action === "zoom-in") {
    log("tools/zoom-in");
    zoomIn();
  } else if (action === "zoom-out") {
    log("tools/zoom-out");
    zoomOut();
  } else if (action === "reset-zoom") {
    log("tools/reset-zoom");
    resetZoom();
  }
}
