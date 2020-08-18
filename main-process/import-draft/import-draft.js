const { dialog, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { defaultStore } = require("../electron-store/store");

let integrationTokenWin;
ipcMain.on("import_draft", (event) => {
  const userDetails = defaultStore.get("userDetails");
  if (userDetails) {
    importDraft(event, userDetails);
  } else {
    integrationTokenWin = new BrowserWindow({
      width: 727,
      height: 509,
      show: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    integrationTokenWin
      .loadURL(
        path.join(
          "file://",
          __dirname,
          "../../render-process/integration-token/integration-token.html"
        )
      )
      .then();
    integrationTokenWin.on("closed", () => {
      integrationTokenWin = null;
    });
  }
});

ipcMain.on("save_userDetails", (event, data) => {
  defaultStore.set("userDetails", data);
  importDraft(event, data);
  integrationTokenWin && integrationTokenWin.close();
});

function importDraft(event, data) {
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
            event.sender.send("new_tab", postResponse.data.data.url);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    })
    .catch((e) => {
      console.log("error in fetching file ", e);
    });
}
