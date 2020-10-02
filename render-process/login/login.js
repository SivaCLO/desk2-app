const { ipcRenderer } = require("electron");
const shell = require("electron").shell;
const { log } = require("../../common/activity");

document.getElementById("submit").addEventListener("click", function () {
  document.getElementById("error-msg").innerHTML = "";
  let token = document.getElementById("token").value;
  let email = document.getElementById("email").value;
  if (token && email) {
    ipcRenderer.send("login-submit", token, email);
  } else {
    document.getElementById("error-msg").innerHTML = "Please enter a token and email";
  }
});

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("login-close");
});

ipcRenderer.on("login-error", (event, error_message) => {
  document.getElementById("error-msg").innerHTML = error_message;
});

ipcRenderer.on("login-token", (event, token) => {
  document.getElementById("token").value = token;
});

ipcRenderer.on("login-email", (event, email) => {
  document.getElementById("email").value = email;
});
