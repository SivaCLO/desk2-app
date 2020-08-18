const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");
const { domain } = require("process");

document.getElementById("submit").addEventListener("click", function () {
  let loginurl = document.getElementById("loginurl").value;
  document.getElementById("loginurl").value = "";
  var domainname = loginurl.includes("medium.com");
  var token = loginurl.includes("token");

  if (domainname && token) {
    console.log("loginurl", loginurl);
    ipcRenderer.send("open_email_signin", loginurl);
    ipcRenderer.send("close_email_signin");
  } else {
    console.log("invalid URL");
  }
});
