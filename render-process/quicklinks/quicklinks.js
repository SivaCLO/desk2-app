const { ipcRenderer } = require("electron");
const { log } = require("../../common/activity");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  let action = event.target.dataset.action;
  if (action === "stats") {
    log("quicklinks/stats");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/stats");
  } else if (action === "profile") {
    log("quicklinks/profile");
    ipcRenderer.send("open-quicklink", "https://medium.com/me");
  } else if (action === "settings") {
    log("quicklinks/settings");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/settings");
  } else if (action === "series") {
    log("quicklinks/series");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/series/drafts");
  } else if (action === "cancel") {
    log("quicklinks/cancel");
  }
  ipcRenderer.send("close-quicklinks-window");
}
