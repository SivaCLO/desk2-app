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
  log("login-window/submit", mediumToken);
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
  log("login-window/login-medium-user", { mediumToken });
  let mediumUser = await getMediumUser(mediumToken);
  defaultStore.set("medium-user", mediumUser);
  log("login-window/login-the-desk-app-user", { mediumUser });
  let theDeskAppUser = await getTheDeskAppUser(mediumUser);
  defaultStore.set("thedeskapp-user", theDeskAppUser);
  log("login-window/login-success", { theDeskAppUser });
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
        showLoginWindow("Your Medium token is invalid");
      });
  });
}

function getTheDeskAppUser(mediumUser) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://thedeskfunctions.azurewebsites.net/api/v2/user/" +
          mediumUser.id +
          "/" +
          mediumUser.username +
          "?code=9bafK2KAjsBONebLekGF0a80YletTdredAJCgRmV8oCqrwlzhlCfMg=="
      )
      .then(function (response) {
        if (response.data.disabled) {
          log("login-window/get-the-desk-app-user/disabled", { response: response.data });
          showLoginWindow("Account disabled");
          reject();
        }
        resolve(response.data);
      })
      .catch((e) => {
        log("login-window/get-the-desk-app-user/error", { e });
        console.error("error in reading The Desk App User", e);
        showLoginWindow("Something went wrong");
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
