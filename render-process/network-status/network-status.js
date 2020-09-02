const { ipcRenderer } = require("electron");
let currentNetworkStatus = "";
setInterval(() => {
  currentNetworkStatus = navigator.onLine ? "online" : "offline";
  ipcRenderer.send("network-status", currentNetworkStatus);
}, 5000);
