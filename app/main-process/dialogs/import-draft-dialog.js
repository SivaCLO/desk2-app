const { dialog, ipcMain } = require("electron");
const fs = require("fs");
const axios = require("axios");
const { defaultStore } = require("../../common/store");
const { getMainWindow } = require("../windows/main-window");
const { log } = require("../../common/activity");

function showImportDialog() {
  log("import-draft-dialog/show");
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Custom File Type", extensions: ["md"] }],
    })
    .then((file) => {
      log("import-draft-dialog/file", { path: file.filePaths[0] });
      if (file.filePaths[0]) {
        fs.readFile(file.filePaths[0], "utf-8", (err, content) => {
          if (err) {
            // alert("An error occurred reading the file :" + err.message);
            const options = {
              type: "info",
              buttons: ["Ok"],
              defaultId: 0,
              cancelId: 0,
              message:
                "You have selected a folder or a file that is not supported. \n\nPlease select a file in markdown format.",
            };
            log("import-draft-dialog/error", { path: file.filePaths[0], err });
            dialog
              .showMessageBox(getMainWindow(), options)
              .then((response) => {})
              .catch((err) => {
                console.error(err);
              });
            return;
          }

          let mediumTokens = defaultStore.get("mediumTokens");
          let mediumUser = defaultStore.get("mediumUser");
          axios
            .post(
              `https://api.medium.com/v1/users/${mediumUser.id}/posts`,
              {
                title: "",
                contentFormat: "markdown",
                content: content,
                publishStatus: "draft",
              },
              {
                headers: {
                  Authorization: `${mediumTokens.token_type} ${mediumTokens.access_token}`,
                },
              }
            )

            .then(function (postResponse) {
              log("import-draft-dialog/success", { url: postResponse.data.data.url });
              getMainWindow().webContents.send("new_tab", postResponse.data.data.url);
            })
            .catch(function (error) {
              log("import-draft-dialog/error", { error, mediumTokens, mediumUser });
              console.error("Error in showImportDialog", error);
            });
        });
      }
    })
    .catch((e) => {
      console.error("error in fetching file ", e);
    });
}

ipcMain.on("open-import-draft-dialog", (event) => {
  showImportDialog();
});

module.exports = { showImportDialog };
