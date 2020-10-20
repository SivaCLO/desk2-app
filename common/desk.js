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
        JSON.stringify(data)
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

async function updateSetting(key, value) {
  let settings = defaultStore.get("deskSettings");
  settings[key] = value;
  defaultStore.set("deskSettings", settings);

  await callDeskUpdate(defaultStore.get("deskId"), { settings });

  log("desk/update-settings-success", { settings });
}

function getSetting(key) {
  let settings = defaultStore.get("deskSettings") || {};
  return settings[key];
}

async function updateFlag(key, value) {
  let flags = defaultStore.get("deskFlags");
  flags[key] = value;
  defaultStore.set("deskFlags", flags);

  await callDeskUpdate(defaultStore.get("deskId"), { flags });

  log("desk/update-flags-success", { flags });
}

function getFlag(key) {
  let flags = defaultStore.get("deskFlags") || {};
  return flags[key];
}

async function updateDraft(draftId, key, value) {
  let drafts = getDrafts();
  let draft = drafts[draftId] || {};
  if (key === "lastOpenedTime" && !draft["openedTime"]) {
    draft["openedTime"] = value;
  }
  draft[key] = value;
  drafts[draftId] = draft;
  defaultStore.set("deskDrafts", drafts);

  await callDeskUpdate(defaultStore.get("deskId"), { drafts });
}

function getDrafts() {
  return defaultStore.get("deskDrafts") || {};
}

module.exports = { getSetting, updateSetting, getFlag, updateFlag, getDrafts, updateDraft };
