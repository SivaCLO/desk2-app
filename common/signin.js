const { defaultStore } = require("./store");
const { log } = require("./activity");
const { signout } = require("./signout");
const axios = require("axios");
const os = require("os");

function callSigninCreate() {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://desk11.azurewebsites.net/api/v1.2/signins?code=5TD8xmd2nnZp2vZJweMiEoF0w/DVyPXvRTBBfNxY/mQZLOEeSUEzOg==`,
        {
          version: {
            deskVersion: defaultStore.get("deskVersion"),
            osPlatform: os.platform(),
            osRelease: os.release(),
            macAddress: defaultStore.get("macAddress"),
            debug: defaultStore.get("debug"),
          },
        }
      )
      .then(function (response) {
        log("signin/callSigninCreate", { signinId: response.data.signinId });
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-create/error", { e });
        console.error(e);
        reject(e);
      });
  });
}

function callSigninRead(signinId) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://desk11.azurewebsites.net/api/v1.2/signins/${signinId}?code=zCDTbdP7PLrcmRPHffxDeqQ/fYnxjj4Ot/qgNl4wXgcTaMm75spLpw==`
      )
      .then(function (response) {
        log("signin/callSigninRead", {
          signinId,
          mediumTokens: response.data.mediumTokens,
          mediumUser: response.data.mediumUser,
        });
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-read/error", { e, signinId });
        console.error(e);
        reject(e);
      });
  });
}

function callSigninDesk(mediumUser) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        defaultStore.get("debug")
          ? `http://localhost:7071/api/v1.2/signin/desk/${mediumUser.id}`
          : `https://desk11.azurewebsites.net/api/v1.2/signin/desk/${mediumUser.id}?code=mgaNstSJulIcetsS3F/a0YLSwDkSYOyAM5ygBS8ZkXNJ7wRcoElg2A==`,
        {
          mediumUser,
          version: {
            deskVersion: defaultStore.get("deskVersion"),
            osPlatform: os.platform(),
            osRelease: os.release(),
            macAddress: defaultStore.get("macAddress"),
            debug: defaultStore.get("debug"),
          },
        }
      )
      .then(function (response) {
        log("signin/callSigninDesk", {
          mediumUser,
          id: response.data.id,
          type: response.data.type,
          settings: response.data.settings,
          flags: response.data.flags,
        });
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-desk/error", { e, mediumUser });
        console.error(e);
        reject(e);
      });
  });
}

function callMediumMe(mediumTokens) {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.medium.com/v1/me", {
        headers: {
          Authorization: `${mediumTokens.token_type} ${mediumTokens.access_token}`,
        },
      })
      .then(function (response) {
        log("signin/callMediumMe", { mediumTokens, mediumUser: response.data.data });
        resolve(response.data.data);
      })
      .catch((e) => {
        log("signin/call-medium-me/error", { e, mediumTokens });
        console.error(e);
        if (e && e.response.status === 401) {
          signout();
        }
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

  let desk = await callSigninDesk(signData.mediumUser);
  defaultStore.set("deskId", desk.id);
  defaultStore.set("deskType", desk.type);
  defaultStore.set("deskSettings", desk.settings);
  defaultStore.set("deskFlags", desk.flags);

  log("signin/signin-setup-success", { mediumUser: signData.mediumUser, desk });
}

async function signinMain() {
  let mediumTokens = defaultStore.get("mediumTokens");

  // TODO: Use Refresh token if this fails. Show Reset message if refresh fails too.
  let mediumUser = await callMediumMe(mediumTokens);
  defaultStore.set("mediumUser", mediumUser);

  let desk = await callSigninDesk(mediumUser);
  defaultStore.set("deskId", desk.id);
  defaultStore.set("deskType", desk.type);
  defaultStore.set("deskSettings", desk.settings);
  defaultStore.set("deskFlags", desk.flags);

  log("signin/signin-main-success", { mediumUser, desk });
}

module.exports = { signinStart, signinSetup, signinMain };
