const { ipcRenderer } = require("electron");

document.getElementById("submit").addEventListener("click", function () {
  document.getElementById("error-msg").innerHTML = "";
  let token = document.getElementById("token").value;
  if (token) {
    ipcRenderer.send("login-submit", token);
    ipcRenderer.send("login-close");
  } else {
    document.getElementById("error-msg").innerHTML = "Please enter a valid medium token";
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
