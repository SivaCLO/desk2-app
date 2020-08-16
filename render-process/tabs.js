const TabGroup = require("./electron-tabs");
const { ipcRenderer } = require("electron");
const { dialog } = require("electron").remote;
var fs = require("fs");
const axios = require("axios");

const Tabs = new TabGroup({
  newTab: {
    title: "Untitled",
    src: "https://medium.com/new-story",
    visible: true,
    active: true,
  },
});

// Adding Default Tab
Tabs.addTab({
  title: "",
  src: "https://medium.com/me/stories/drafts",
  iconURL: "assets/app-icon/png/512.png",
  visible: true,
  active: true,
  closable: false,
});

function newTab () {
  Tabs.addTab();
};

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
            console.log("postResponse ", postResponse);
            Tabs.addTab({
              title: "Untitled",
              src: postResponse.data.data.url,
              visible: true,
              active: true,
              closable: true,
            });
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

module.exports = { newTab }
