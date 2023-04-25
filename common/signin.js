const { defaultStore } = require("./store");
const { log } = require("./activity");
const { deskSignin, deskSignout } = require("./desk");
const { callMediumUserJSON } = require("./undocumented");
const axios = require("axios");
const os = require("os");

function callSigninCreate() {
  return new Promise((resolve, reject) => {
    axios
      .post(
        defaultStore.get("debug")
          ? `http://localhost:5050/v20/signin`
          : `https://goldfish-app-kqhm2.ondigitalocean.app/api/v20/signins`,
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
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-signin-read/error", { e, signinId });
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
        resolve(response.data.data);
      })
      .catch((e) => {
        log("signin/call-medium-me/error", { e, mediumTokens });
        console.error(e);
        if (e && e.response.status === 401) {
          deskSignout();
        }
        reject(e);
      });
  });
}

async function signinStart() {
  let data = await callSigninCreate();
  defaultStore.set("signinId", data.signinId);
  log("signin/start", { signinId: data.signinId });
}

async function signinSetup() {
  let signinId = defaultStore.get("signinId");
  let signinData = await callSigninRead(signinId);
  defaultStore.set("mediumTokens", signinData.mediumTokens);
  defaultStore.set("mediumUser", signinData.mediumUser);

  log("signin/medium", { signinId, signinData });

  let mediumUserJSON = await callMediumUserJSON(signinData.mediumUser.url);
  defaultStore.set("mediumUserJSON", mediumUserJSON);

  await deskSignin();
}

async function signinMain() {
  // TODO: Use Refresh token if this fails. Show Reset message if refresh fails too.
  let mediumTokens = defaultStore.get("mediumTokens");
  let mediumUser = await callMediumMe(mediumTokens);
  defaultStore.set("mediumUser", mediumUser);

  let mediumUserJSON = await callMediumUserJSON(mediumUser.url);
  defaultStore.set("mediumUserJSON", mediumUserJSON);

  await deskSignin();
}

module.exports = { signinStart, signinSetup, signinMain };
