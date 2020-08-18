const { ipcRenderer } = require("electron");

document.getElementById("submit").addEventListener("click", function () {
  let loginUrl = document.getElementById("loginUrl").value;
  document.getElementById("loginUrl").value = "";
  const domainName = loginUrl.includes("medium.com");
  const token = loginUrl.includes("token");

  if (domainName && token) {
    ipcRenderer.send("open_email_signin", loginUrl);
    ipcRenderer.send("close_email_signin");
  }
});
