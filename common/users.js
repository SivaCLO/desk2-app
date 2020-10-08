const { app } = require("electron");
const { defaultStore } = require("./store");
const { log } = require("./activity");
const axios = require("axios");
const os = require("os");

function callUserUpdate(deskUserId, data) {
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
        log("users/call-user-update/error", { e, data });
        console.error("Error in userUpdate", e);
        reject(e);
      });
  });
}

async function updateSettings(key, value) {
  let settings = defaultStore.get("deskSettings");
  settings[key] = value;
  defaultStore.set("deskSettings", settings);

  await callUserUpdate(defaultStore.get("deskUserId"), { settings });

  log("users/settings-update-success", { settings });
}

async function updateFlags(key, value) {
  let flags = defaultStore.get("deskFlags");
  flags[key] = value;

  await callUserUpdate(defaultStore.get("deskUserId"), { flags });

  log("users/flags-update-success", { flags });
}

module.exports = { updateSettings, updateFlags };
