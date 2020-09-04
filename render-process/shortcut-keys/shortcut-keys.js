const { ipcRenderer } = require("electron");

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("close-shortcut-window");
});

