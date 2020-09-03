const { ipcRenderer } = require("electron");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event).then();
  }
});

async function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;
  if (action === "submit") {
    document.getElementById("error_msg").innerHTML = "";
    let token = document.getElementById("token").value;
    if (token) {
      ipcRenderer.send("login", token);
    } else {
      document.getElementById("error_msg").innerHTML = "Please enter a valid medium token";
    }
  } else if (action === "cancel") {
    ipcRenderer.send("login");
  }
}

ipcRenderer.on("login-error", (event, error_message) => {
  document.getElementById("error_msg").innerHTML = error_message;
});

ipcRenderer.on("login-token", (event, token) => {
  document.getElementById("token").value = token;
});
