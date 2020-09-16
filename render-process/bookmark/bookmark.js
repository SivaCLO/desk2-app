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
        log("bookmark/stats");
        ipcRenderer.send('load-bookmark',"https://medium.com/me/stats")
    }else if (action === "profile") {
        log("bookmark/profile");
        ipcRenderer.send('load-bookmark',"https://medium.com/me")
    }else if (action === "settings") {
        log("bookmark/settings");
        ipcRenderer.send('load-bookmark',"https://medium.com/me/settings")
    }else if (action === "series") {
        log("bookmark/series");
        ipcRenderer.send('load-bookmark',"https://medium.com/me/series/drafts")
    }
    
    ipcRenderer.send("bookmark-close");
  }

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("bookmark-close");
});
