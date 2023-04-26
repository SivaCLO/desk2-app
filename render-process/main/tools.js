const Remote = require("@electron/remote");
const { ipcRenderer } = require("electron");
const { enterZenMode, exitZenMode, zoomIn, zoomOut, resetZoom } = require("./tabs");
const { log } = require("../../common/activity");
const path = require("path");

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
    log("tools/home");
    Remote.getCurrentWindow()
      .getBrowserView()
      .webContents.loadURL("file://" + path.join(__dirname, "start.html"))
      .then();
  } else if (action === "refresh") {
    log("tools/reload");
    Remote.getCurrentWindow().getBrowserView().webContents.reload();
  } else if (action === "back") {
    log("tools/back");
    Remote.getCurrentWindow().getBrowserView().webContents.goBack();
  } else if (action === "forward") {
    log("tools/forward");
    Remote.getCurrentWindow().getBrowserView().webContents.goForward();
  } else if (action === "copy-link") {
    log("tools/copy-link");
    let str = Remote.getCurrentWindow().getBrowserView().webContents.getURL();
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert(`Link Copied`);
  } else if (action === "exit-zen-mode") {
    log("tools/exit-zen-mode");
    exitZenMode();
  }
}
