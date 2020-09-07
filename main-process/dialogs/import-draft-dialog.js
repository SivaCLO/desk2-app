const { dialog, ipcMain } = require("electron");
const fs = require("fs");
const axios = require("axios");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");

ipcMain.on("open-import-draft-dialog", (event) => {
  log("open/dialog/import-draft");
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
        log("dialog/import-draft/info", { mediumToken, mediumUser });
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
            console.error(error);
          });
      });
    })
    .catch((e) => {
      console.error("error in fetching file ", e);
    });
});
