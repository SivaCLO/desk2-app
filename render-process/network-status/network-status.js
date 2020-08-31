const { ipcRenderer } = require("electron");

var status = "";
setInterval(() => {
  status = navigator.onLine ? "online" : "Offline";
  document.getElementById("network-status").innerText = status;
  status ? ipcRenderer.send("network-status", status) : null;
}, 1000);
