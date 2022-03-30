const Remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const { enterZenMode, exitZenMode, zoomIn, zoomOut, resetZoom } = require("./tabs");
const { log } = require("../../common/activity");
const path = require("path");
const { desktopCapturer } = require("electron");
const { screen } = Remote;

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

ipcRenderer.on("screenshot", (e, args) => {
  screenScreenshot();
});

async function screenScreenshot() {
  const thumbSize = determineScreenShotSize();
  let options = { types: ["screen"], thumbnailSize: thumbSize };
  try {
    let temp = await desktopCapturer.getSources(options);
    temp.forEach(function (source) {
      if (source.name) {
        const content = source.thumbnail.toPNG();
        ipcRenderer.send("insert-screenshot", { content });
      }
    });
  } catch (error) {
    log("screenScreenshot -> error", error);
  }
}

function determineScreenShotSize() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  return {
    width: screenSize.width,
    height: screenSize.height,
  };
}
