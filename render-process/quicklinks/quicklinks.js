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
  } else if (action === "stories") {
    log("quicklinks/stories");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/stories/public");
  } else if (action === "cancel") {
    log("quicklinks/cancel");
  }
  ipcRenderer.send("close-quicklinks-window");
}
