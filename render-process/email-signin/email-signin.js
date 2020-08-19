const { ipcRenderer } = require("electron");

document.getElementById("submit").addEventListener("click", function () {
  let loginUrl = document.getElementById("loginUrl").value;
  document.getElementById("loginUrl").value = "";
  const domainName = loginUrl.includes("medium.com");
  const token = loginUrl.includes("token");

  if (domainName && token) {
    ipcRenderer.send("load-url-medium-view", loginUrl);
    ipcRenderer.send("close-email-signin-window");
  }
});
