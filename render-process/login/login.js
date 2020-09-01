const { ipcRenderer } = require("electron");
const axios = require("axios");

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
    let mediumUser = await getMediumUser(token);
    if (mediumUser) {
      ipcRenderer.send("save-user", token, mediumUser, mediumUser);
    }
  }
}

function getMediumUser(token) {
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
        console.log("Reading Medium User", e);
        document.getElementById("error_msg").innerHTML = "User not found!";
      });
  });
}
