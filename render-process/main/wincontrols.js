const remote = require("electron").remote;
const { ipcRenderer } = require("electron");
const os = require("os");

if (os.platform() !== "darwin") {
  document.getElementById("wincontrol").style.display = "block";
}

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;

  if (action === "menu") {
    let x = event.x;
    let y = event.y;
    ipcRenderer.send(`display-app-menu`, { x, y });
  } else if (action === "minimize") {
    const window = remote.getCurrentWindow();
    window.minimize();
  } else if (action === "maximize") {
    const window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  } else if (action === "close") {
    const window = remote.getCurrentWindow();
    window.close();
  }
}
