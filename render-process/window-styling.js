const { ipcRenderer } = require("electron");

ipcRenderer.on("window-styling", (event, data) => {
  if (data.windowStatus || data.platfrom === "isWin")
    document.getElementById("tabs").classList.replace("etab-padding", "etab-padding-none");
  else document.getElementById("tabs").classList.replace("etab-padding-none", "etab-padding");
});
