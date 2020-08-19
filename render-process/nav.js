const currentWindow = require("electron").remote.getCurrentWindow();
const { ipcRenderer } = require("electron");
const { newTab } = require("./tabs/tabs");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;
  if (action === "drafts") {
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
}
