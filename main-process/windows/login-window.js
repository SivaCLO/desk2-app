const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");
const axios = require("axios");
const { showMainWindow } = require("./main-window");

let loginWindow = null;

function showLoginWindow(errorMessage) {
  log("window/login-window/show");
  if (!loginWindow) {
    loginWindow = new BrowserWindow({
      width: 600,
      height: 300,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
      },
    });
    loginWindow.loadURL(path.join("file://", __dirname, "../../render-process/login/login.html")).then(() => {
      let mediumToken = defaultStore.get("medium-token");
      if (mediumToken) {
        loginWindow.webContents.send("login-token", mediumToken);
      }
      if (errorMessage) {
        loginWindow.webContents.send("login-error", errorMessage);
      }
    });
    loginWindow.on("closed", () => {
      loginWindow = null;
    });
  }
}

ipcMain.on("login-submit", (e, mediumToken) => {
  log("window/login-window/submit");
  defaultStore.set("medium-token", mediumToken);
  login().then(() => {
    showMainWindow();
  });
});

ipcMain.on("login-close", (e, mediumToken) => {
  log("window/login-window/close");
  loginWindow.close();
  loginWindow = null;
});

async function login() {
  let mediumToken = defaultStore.get("medium-token");
  let mediumUser = await getMediumUser(mediumToken);
  let mediumdeskUser = await getMediumdeskUser(mediumToken, mediumUser.id);
  log("window/login-window-function/login", { mediumToken, mediumUser, mediumdeskUser });
  defaultStore.set("medium-user", mediumUser);
  defaultStore.set("mediumdesk-user", mediumdeskUser);
}

function getMediumUser(mediumToken) {
  log("window/login-window-function/get-medium-user", { mediumToken });
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url: "https://api.medium.com/v1/me",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${mediumToken}`,
      },
    })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch((e) => {
        console.error("error in reading Medium User", e);
        showLoginWindow("Your Medium token is invalid. We couldn't find your account.");
      });
  });
}

function getMediumdeskUser(mediumToken, mediumUserId) {
  log("window/login-window-function/get-mediumdesk-user", { mediumToken, mediumUserId });
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://md-functions.azurewebsites.net/api/v2/user/" +
          mediumUserId +
          "?code=hBgZZN/vkdDH3W9aw5Ok6k9i0EJ4iIdEWlracZjabo6ojWFaaQ5S9w=="
      )
      .then(function (response) {
        if (response.data.disabled) {
          showLoginWindow(
            "Your mediumdesk subscription is not active. Please reach out to <a href='yourfriends@mediumdesk.com'>yourfriends@mediumdesk.com</a>"
          );
          reject();
        }
        resolve(response.data);
      })
      .catch((e) => {
        console.error("error in reading Mediumdesk User", e);
        showLoginWindow(
          "Something went wrong. Please reach out to <a href='yourfriends@mediumdesk.com'>yourfriends@mediumdesk.com</a>"
        );
      });
  });
}

function logout() {
  log("window/login-window/logout");
  defaultStore.delete("medium-token");
  defaultStore.delete("medium-user");
  defaultStore.delete("mediumdesk-user");
  app.exit(0);
}

module.exports = { showLoginWindow, login, logout };
