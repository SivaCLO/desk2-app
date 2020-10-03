const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");
const axios = require("axios");
const { showMainWindow } = require("./main-window");
const os = require("os");

let loginWindow = null;

function showLoginWindow(errorMessage) {
  log("login-window/show");
  if (!loginWindow) {
    loginWindow = new BrowserWindow({
      width: 600,
      height: 300,
      frame: os.platform() === "linux",
      autoHideMenuBar: os.platform() === "linux",
      resizable: false,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    loginWindow.loadURL(path.join("file://", __dirname, "../../render-process/login/login.html")).then(() => {
      loadValues(errorMessage);
    });
    loginWindow.on("closed", () => {
      loginWindow = null;
    });
  } else {
    loadValues(errorMessage);
  }
}

function loadValues(errorMessage) {
  let mediumToken = defaultStore.get("medium-token");
  if (mediumToken) {
    log("login-window/existing-token", { mediumToken });
    loginWindow.webContents.send("login-token", mediumToken);
  }
  let userEmail = defaultStore.get("user-email");
  if (userEmail) {
    log("login-window/existing-email", { userEmail });
    loginWindow.webContents.send("login-email", userEmail);
  }
  if (errorMessage) {
    log("login-window/existing-error", { errorMessage });
    loginWindow.webContents.send("login-error", errorMessage);
  }
}

ipcMain.on("login-submit", (e, mediumToken, userEmail) => {
  log("login-window/submit", { mediumToken, userEmail });
  defaultStore.set("medium-token", mediumToken);
  defaultStore.set("user-email", userEmail);
  login().then(() => {
    showMainWindow();
    close();
  });
});

ipcMain.on("login-close", () => {
  close();
});

function close() {
  log("login-window/close");
  if (loginWindow) {
    loginWindow.close();
  }
}

async function login() {
  let mediumToken = defaultStore.get("medium-token");
  let userEmail = defaultStore.get("user-email");
  log("login-window/login-medium-user", { mediumToken, userEmail });
  let mediumUser = await getMediumUser(mediumToken);
  defaultStore.set("medium-user", mediumUser);
  log("login-window/login-the-desk-app-user", { mediumUser, userEmail });
  let theDeskAppUser = await getTheDeskAppUser(mediumUser, userEmail);
  defaultStore.set("desk-user", theDeskAppUser);
  defaultStore.set("desk-type", theDeskAppUser.deskType);
  log("login-window/login-success", { theDeskAppUser, mediumUser, mediumToken, userEmail });
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
        log("login-window/get-medium-user/error", { error: e && e.code, mediumToken });
        console.error("Failed to read Medium User", e && e.code, mediumToken);
        if (e && e.code) {
          showLoginWindow("Something went wrong");
        } else {
          showLoginWindow("Your Medium token is invalid");
        }
      });
  });
}

function getTheDeskAppUser(mediumUser, userEmail) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        (defaultStore.get("debug")
          ? "http://localhost:7071/api/user110/"
          : "https://desk11.azurewebsites.net/api/user110/") +
          mediumUser.username +
          "?code=o2GyI90ptVXum9C7zZYz4CGy5foWcDMkhzONF2aV0skbfTerrVuD6Q==",
        {
          userEmail,
        }
      )
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("login-window/get-the-desk-app-user/error", { error: e && e.code, mediumUser });
        console.error("Error in reading The Desk App User", e);
        showLoginWindow("Something went wrong");
      });
  });
}

function logout() {
  log("login-window/logout");
  defaultStore.delete("medium-token");
  defaultStore.delete("user-email");
  defaultStore.delete("medium-user");
  defaultStore.delete("desk-user");
  defaultStore.delete("desk-type");
  app.exit(0);
}

module.exports = { showLoginWindow, login, logout };
