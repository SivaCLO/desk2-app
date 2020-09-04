const { app, dialog, ipcMain } = require("electron");
const { getMainWindow } = require("../windows/main-window");

let isOffline = false;

ipcMain.on("network-status", (event, data) => {
  if (data === "offline") {
    if (!isOffline) {
      const options = {
        type: "warning",
        buttons: ["Close MediumDesk", "Keep Working"],
        defaultId: 0,
        cancelId: 1,
        message: "Your network status is offline",
        detail: "Please check your internet connection",
      };

      dialog
        .showMessageBox(getMainWindow(), options)
        .then((response) => {
          if (response.response === 0) {
            app.exit(0);
          }
        })
        .catch((err) => {
          console.error(err);
        });
      isOffline = true;
    }
  } else {
    if (isOffline) {
      const options = {
        type: "info",
        buttons: ["Ok"],
        defaultId: 0,
        cancelId: 0,
        message: "You are back online!",
      };

      dialog
        .showMessageBox(getMainWindow(), options)
        .then((response) => {
          if (response.response === 1) {
            app.exit(0);
          }
        })
        .catch((err) => {
          console.error(err);
        });
      isOffline = false;
    }
  }
});
