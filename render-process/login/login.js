const { ipcRenderer } = require("electron");
const shell = require("electron").shell;
const { log } = require("../../common/activity");

document.getElementById("submit").addEventListener("click", function () {
  document.getElementById("error-msg").innerHTML = "";
  let token = document.getElementById("token").value;
  if (token) {
    ipcRenderer.send("login-submit", token);
  } else {
    document.getElementById("error-msg").innerHTML = "Please enter a Medium token";
  }
});

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("login-close");
});

document.body.addEventListener("click", function (e) {
  if (e.target.id == "signup") {
    log("login/singup", { mediumToken: document.getElementById("token").value });
    e.preventDefault();
    shell.openExternal("https://medium.com/desktop-app");
  }
});

ipcRenderer.on("login-error", (event, error_message) => {
  document.getElementById("error-msg").innerHTML = error_message;
});

ipcRenderer.on("login-token", (event, token) => {
  document.getElementById("token").value = token;
});
