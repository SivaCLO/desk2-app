const { app, dialog, ipcMain } = require("electron");
const { getMainWindow } = require("../windows/main-window");
const { log } = require("../../common/activity");

let isOffline = false;

ipcMain.on("network-status", (event, data) => {
  log("network-status-dialog/status-check", { status: data });
  if (data === "offline") {
    if (!isOffline) {
      log("network-status-dialog/offline-dialog");
      const options = {
        type: "warning",
        buttons: ["Close Application", "Keep Working"],
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
      log("network-status-dialog/online-dialog");
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
