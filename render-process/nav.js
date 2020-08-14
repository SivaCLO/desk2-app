const currentWindow = require("electron").remote.getCurrentWindow();
const path = require("path");
const { ipcMain, ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;
var fs = require("fs");
const axios = require("axios");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

ipcRenderer.on("open_import_dialogue", (evt, data) => {
  dialog
    .showOpenDialog({
      properties: ["openFile", "openDirectory"],
      filters: [{ name: "Custom File Type", extensions: ["md"] }],
    })
    .then((file) => {
      fs.readFile(file.filePaths[0], "utf-8", (err, content) => {
        if (err) {
          alert("An error ocurred reading the file :" + err.message);
          return;
        }
        axios({
          method: "post",
          url: `https://api.medium.com/v1/users/${data.userData.id}/posts`,
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          data: {
            title: "",
            contentFormat: "markdown",
            content: content,
            publishStatus: "draft",
          },
        })
          .then(function (postResponse) {
            currentWindow
              .getBrowserView()
              .webContents.loadURL(`${postResponse.data.data.url}`);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    })
    .catch((e) => {
      console.log("error in fetching file ", e);
    });
});

function handleAction(event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;
  if (action === "stats" || action === "settings") {
    currentWindow
      .getBrowserView()
      .webContents.loadURL(`https://medium.com/me/${action}`);
  } else if (action === "draft") {
    currentWindow
      .getBrowserView()
      .webContents.loadURL(`https://medium.com/me/stories/drafts`);
  } else if (action === "published") {
    currentWindow
      .getBrowserView()
      .webContents.loadURL(`https://medium.com/me/stories/public`);
  } else if (action === "profile") {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me`);
  } else if (action === "new") {
    currentWindow
      .getBrowserView()
      .webContents.loadURL(`https://medium.com/new-story`);
  } else if (action === "home") {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com`);
  } else if (action === "import") {
    ipcRenderer.send("import_a_story");
  }
}
