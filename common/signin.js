const { defaultStore } = require("./store");
const { log } = require("./activity");
const axios = require("axios");
const os = require("os");

function callSigninCreate() {
  log("signin/callSigninCreate");
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://desk11.azurewebsites.net/api/v1.2/signins?code=5TD8xmd2nnZp2vZJweMiEoF0w/DVyPXvRTBBfNxY/mQZLOEeSUEzOg==`,
        {
          appInfo: {
            appVersion: defaultStore.get("appVersion"),
            osPlatform: os.platform(),
            osRelease: os.release(),
            debug: defaultStore.get("debug"),
          },
        }
      )
      .then(function (response) {
        // signinId
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-create/error", { e });
        console.error("Error in signinCreate", e);
        reject(e);
      });
  });
}

function callSigninRead(signinId) {
  log("signin/callSigninRead", { signinId });
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://desk11.azurewebsites.net/api/v1.2/signins/${signinId}?code=zCDTbdP7PLrcmRPHffxDeqQ/fYnxjj4Ot/qgNl4wXgcTaMm75spLpw==`
      )
      .then(function (response) {
        // mediumTokens, mediumUser
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-read/error", { e, signinId });
        console.error("Error in signinRead", e);
        reject(e);
      });
  });
}

function callSigninUser(mediumUser) {
  log("signin/callSigninUser", { mediumUser });
  return new Promise((resolve, reject) => {
    axios
      .post(
        defaultStore.get("debug")
          ? `http://localhost:7071/api/v1.2/signin/user/${mediumUser.id}`
          : `https://desk11.azurewebsites.net/api/v1.2/signin/user/${mediumUser.id}?code=mgaNstSJulIcetsS3F/a0YLSwDkSYOyAM5ygBS8ZkXNJ7wRcoElg2A==`,
        {
          mediumUser,
          appInfo: {
            appVersion: defaultStore.get("appVersion"),
            osPlatform: os.platform(),
            osRelease: os.release(),
          },
        }
      )
      .then(function (response) {
        // deskUserId, deskType, userSettings
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-user/error", { e, mediumUser });
        console.error("Error in signinUser", e);
        reject(e);
      });
  });
}

function callMediumMe(mediumTokens) {
  log("signin/callMediumMe", { mediumTokens });
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.medium.com/v1/me", {
        headers: {
          Authorization: `${mediumTokens.token_type} ${mediumTokens.access_token}`,
        },
      })
      .then(function (response) {
        resolve(response.data.data);
      })
      .catch((e) => {
        log("signin/medium-me/error", { e, mediumTokens });
        console.error("Error in mediumMe", e);
        reject(e);
      });
  });
}

async function signinStart() {
  let data = await callSigninCreate();
  defaultStore.set("signinId", data.signinId);
}

async function signinSetup() {
  let signinId = defaultStore.get("signinId");

  let signData = await callSigninRead(signinId);
  defaultStore.set("mediumTokens", signData.mediumTokens);
  defaultStore.set("mediumUser", signData.mediumUser);

  let deskUserData = await callSigninUser(signData.mediumUser);
  defaultStore.set("deskUserId", deskUserData.id);
  defaultStore.set("deskType", deskUserData.deskType);
  defaultStore.set("deskSettings", deskUserData.settings);
  defaultStore.set("deskFlags", deskUserData.flags);

  log("signin/signin-setup-success", { deskUserData, mediumUser: signData.mediumUser });
}

async function signinMain() {
  let mediumTokens = defaultStore.get("mediumTokens");

  // TODO: Use Refresh token if this fails. Show Reset message if refresh fails too.
  let mediumUser = await callMediumMe(mediumTokens);
  defaultStore.set("mediumUser", mediumUser);

  let deskUserData = await callSigninUser(mediumUser);
  defaultStore.set("deskUserId", deskUserData.id);
  defaultStore.set("deskType", deskUserData.deskType);
  defaultStore.set("deskSettings", deskUserData.settings);
  defaultStore.set("deskFlags", deskUserData.flags);

  log("signin/signin-main-success", { deskUserData, mediumUser });
}

module.exports = { signinStart, signinSetup, signinMain };
