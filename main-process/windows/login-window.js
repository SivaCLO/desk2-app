const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");
const axios = require("axios");
const { showMainWindow } = require("./main-window");

let loginWindow = null;

function showLoginWindow(errorMessage) {
  log("login-window/show");
  if (!loginWindow) {
    loginWindow = new BrowserWindow({
      width: 600,
      height: 300,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    loginWindow.loadURL(path.join("file://", __dirname, "../../render-process/login/login.html")).then(() => {
      let mediumToken = defaultStore.get("medium-token");
      if (mediumToken) {
        log("login-window/existing-token", { mediumToken });
        loginWindow.webContents.send("login-token", mediumToken);
      }
      if (errorMessage) {
        log("login-window/existing-error", { errorMessage });
        loginWindow.webContents.send("login-error", errorMessage);
      }
    });
    loginWindow.on("closed", () => {
      loginWindow = null;
    });
  }
}

ipcMain.on("login-submit", (e, mediumToken) => {
  log("login-window/submit");
  defaultStore.set("medium-token", mediumToken);
  login().then(() => {
    showMainWindow();
  });
});

ipcMain.on("login-close", (e, mediumToken) => {
  log("login-window/close");
  loginWindow.close();
  loginWindow = null;
});

async function login() {
  let mediumToken = defaultStore.get("medium-token");
  log("login-window/login-token", { mediumToken });
  let mediumUser = await getMediumUser(mediumToken);
  log("login-window/login-medium-user", { mediumToken, mediumUser });
  let theDeskAppUser = await getTheDeskAppUser(mediumUser.id);
  log("login-window/login-the-desk-app-user", { mediumToken, mediumUser, theDeskAppUser });
  defaultStore.set("medium-user", mediumUser);
  defaultStore.set("thedeskapp-user", theDeskAppUser);
}

function getMediumUser(mediumToken) {
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
        log("login-window/get-medium-user/error", { e });
        console.error("error in reading Medium User", e);
        showLoginWindow("Your Medium token is invalid. We couldn't find your account.");
      });
  });
}

function getTheDeskAppUser(mediumUserId) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://thedeskfunctions.azurewebsites.net/api/v2/user/" +
          mediumUserId +
          "?code=9bafK2KAjsBONebLekGF0a80YletTdredAJCgRmV8oCqrwlzhlCfMg=="
      )
      .then(function (response) {
        if (response.data.disabled) {
          log("login-window/get-the-desk-app-user/disabled", { response: response.data });
          showLoginWindow(
            "Your subscription is not active. Please reach out to <a href='yourfriends@thedesk.co'>yourfriends@thedesk.co</a>"
          );
          reject();
        }
        resolve(response.data);
      })
      .catch((e) => {
        log("login-window/get-the-desk-app-user/error", { e });
        console.error("error in reading The Desk App User", e);
        showLoginWindow(
          "Something went wrong. Reach out to <a href='yourfriends@thedesk.co'>yourfriends@thedesk.co</a>"
        );
      });
  });
}

function logout() {
  log("login-window/logout");
  defaultStore.delete("medium-token");
  defaultStore.delete("medium-user");
  defaultStore.delete("thedeskapp-user");
  app.exit(0);
}

module.exports = { showLoginWindow, login, logout };
