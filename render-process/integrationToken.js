const { ipcRenderer } = require("electron");
const axios = require("axios");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

async function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;
  if (action === "save_userDetails") {
    document.getElementById("error_msg").innerHTML = "";
    let token = document.getElementById("token").value;
    let userData = await verifyToken(token);
    if (userData) {
      ipcRenderer.send("save_userDetails", { token, userData });
    }
  }
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url: "https://api.medium.com/v1/me",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch((e) => {
        console.log("e ", e);
        document.getElementById("error_msg").innerHTML = "Invalid Token!";
      });
  });
}
