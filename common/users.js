const { app } = require("electron");
const { defaultStore } = require("./store");
const { log } = require("./activity");
const axios = require("axios");
const os = require("os");

function callUserUpdate(deskUserId, data) {
  log("signin/callUserUpdate", { deskUserId, data });
  return new Promise((resolve, reject) => {
    axios
      .post(
        defaultStore.get("debug")
          ? `http://localhost:7071/api/v1.2/users/${deskUserId}`
          : `https://desk11.azurewebsites.net/api/v1.2/users/${deskUserId}?code=oNVpkYFSzpWxPyg23YvZAej0yB1WKqg0SRLroTNZwXRno3ZveabFPw==`,
        data
      )
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("signin/call-user-update/error", { e, deskUserId, data });
        console.error("Error in userUpdate", e);
        reject(e);
      });
  });
}

async function updateSettings(key, value) {
  let settings = defaultStore.get("deskSettings");
  settings[key] = value;

  await callUserUpdate(defaultStore.get("deskUserId"), { settings });

  log("users/update-success", { settings });
}

async function updateFlags(key, value) {
  let flags = defaultStore.get("deskFlags");
  flags[key] = value;

  await callUserUpdate(defaultStore.get("deskUserId"), { flags });

  log("users/update-success", { flags });
}

module.exports = { updateSettings, updateFlags };
