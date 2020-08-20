const currentWindow = require("electron").remote.getCurrentWindow();
const { ipcRenderer } = require("electron");
const { newTab, Tabs } = require("../tabs/tabs");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;

  // Medium Tools
  if (action === "home") {
    currentWindow
      .getBrowserView()
      .webContents.loadURL(`https://medium.com/me/stories/drafts`);
  } else if (action === "refresh") {
    currentWindow.getBrowserView().webContents.reload();
  } else if (action === "back") {
    currentWindow.getBrowserView().webContents.goBack();
  } else if (action === "forward") {
    currentWindow.getBrowserView().webContents.goForward();
  } else if (action === "new-draft") {
    newTab();
  } else if (action === "import-draft") {
    ipcRenderer.send("open-import-draft-window");
  }

  // Draft Tools
  else if (action === "backToDrafts") {
    Tabs.getTab(0).activate();
    Tabs.getTab(0).view.browserView.webContents.loadURL("https://medium.com/me/stories/drafts");
  }
}
