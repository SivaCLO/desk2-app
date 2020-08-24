const Remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const { Tabs } = require("../tabs/tabs");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

var previousTitle;

document.body.addEventListener("mouseover", (event) => {
  if (event.target.dataset.tooltip) {
    if (Tabs.getActiveTab().viewType === "medium") {
      let mediumToolsTitle = document.getElementById("medium-tools-title");
      if (!previousTitle) previousTitle = mediumToolsTitle.innerHTML;
      mediumToolsTitle.innerHTML = "<b>" + event.target.dataset.tooltip + "</b>";
    } else {
      let draftToolsTitle = document.getElementById("draft-tools-title");
      if (!previousTitle) previousTitle = draftToolsTitle.innerHTML;
      draftToolsTitle.innerHTML = "<b>" + event.target.dataset.tooltip + "</b>";
    }
  } else {
    Tabs.getActiveTab().setTitle(Tabs.getActiveTab().view.browserView.webContents.getTitle());
  }
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;

  // Medium Tools
  if (action === "home") {
    Remote.getCurrentWindow().getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`);
  } else if (action === "refresh") {
    Remote.getCurrentWindow().getBrowserView().webContents.reload();
  } else if (action === "back") {
    Remote.getCurrentWindow().getBrowserView().webContents.goBack();
  } else if (action === "forward") {
    Remote.getCurrentWindow().getBrowserView().webContents.goForward();
  } else if (action === "import-draft") {
    ipcRenderer.send("open-import-draft-window");
  } else if (action === "open-link") {
    Remote.shell.openExternal(Remote.getCurrentWindow().getBrowserView().webContents.getURL());
  }

  // Draft Tools
  else if (action === "backToDrafts") {
    Tabs.getTab(0).activate();
    Tabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/drafts");
  } else if (action === "zen-mode") {
    Remote.getCurrentWindow().setFullScreen(true);
    document.getElementById("tabs").classList.remove("visible");
    document.getElementById("draft-tools").classList.remove("active");
    document.getElementById("zen-tools").classList.add("active");
  } else if (action === "exit-zen-mode") {
    Remote.getCurrentWindow().setFullScreen(false);
    document.getElementById("zen-tools").classList.remove("active");
    document.getElementById("draft-tools").classList.add("active");
    document.getElementById("tabs").classList.add("visible");
  }
}
