const { defaultStore } = require("./store");
const { log } = require("./activity");
const axios = require("axios");

function callDeskUpdate(deskId, data) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        defaultStore.get("debug")
          ? `http://localhost:7071/api/v1.2/desks/${deskId}`
          : `https://desk11.azurewebsites.net/api/v1.2/desks/${deskId}?code=oNVpkYFSzpWxPyg23YvZAej0yB1WKqg0SRLroTNZwXRno3ZveabFPw==`,
        data
      )
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/call-desk-update/error", { e, data });
        console.error(e);
        reject(e);
      });
  });
}

async function updateSettings(key, value) {
  let settings = defaultStore.get("deskSettings");
  settings[key] = value;
  defaultStore.set("deskSettings", settings);

  await callDeskUpdate(defaultStore.get("deskId"), { settings });

  log("desk/update-settings-success", { settings });
}

async function updateFlags(key, value) {
  let flags = defaultStore.get("deskFlags");
  flags[key] = value;

  await callDeskUpdate(defaultStore.get("deskId"), { flags });

  log("desk/update-flags-success", { flags });
}

module.exports = { updateSettings, updateFlags };
