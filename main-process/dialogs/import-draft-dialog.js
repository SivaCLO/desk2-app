const { dialog, ipcMain } = require("electron");
const fs = require("fs");
const axios = require("axios");
const { defaultStore } = require("../../common/store");

ipcMain.on("open-import-draft-dialog", (event) => {
  showImportDraftDialog(event);
});

function showImportDraftDialog(event) {
  dialog
    .showOpenDialog({
      properties: ["openFile", "openDirectory"],
      filters: [{ name: "Custom File Type", extensions: ["md"] }],
    })
    .then((file) => {
      fs.readFile(file.filePaths[0], "utf-8", (err, content) => {
        if (err) {
          alert("An error occurred reading the file :" + err.message);
          return;
        }

        let mediumToken = defaultStore.get("medium-token");
        let mediumUser = defaultStore.get("medium-user");

        axios({
          method: "post",
          url: `https://api.medium.com/v1/users/${mediumUser.id}/posts`,
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${mediumToken}`,
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

module.exports = { showImportDraftDialog };
