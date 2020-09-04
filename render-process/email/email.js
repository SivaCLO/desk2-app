const { ipcRenderer } = require("electron");

document.getElementById("submit").addEventListener("click", function () {
  document.getElementById("error-msg").innerHTML = "";
  let magicLink = document.getElementById("magic-link").value;
  if (magicLink && magicLink.includes("medium.com") && magicLink.includes("token")) {
    ipcRenderer.send("email-submit", magicLink);
    ipcRenderer.send("email-close");
  } else {
    document.getElementById("error-msg").innerHTML = "Please enter a valid medium magic link";
  }
});

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("email-close");
});
