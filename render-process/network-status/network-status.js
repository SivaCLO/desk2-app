const { ipcRenderer } = require("electron");

const updateOnlineStatus = () => {
  ipcRenderer.send("network-status", navigator.onLine ? "online" : "offline");
  document.getElementById("network-status").innerText = navigator.onLine ? "" : "Offline";
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();
