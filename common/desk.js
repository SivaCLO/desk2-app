const { app, session } = require("electron");
const { defaultStore } = require("./store");
const { log } = require("./activity");
const { callMediumPostJSON } = require("./undocumented");
const axios = require("axios");
const os = require("os");

function deskPUT(deskId, desk) {
  return new Promise((resolve, reject) => {
    axios
      .put(`${defaultStore.get("deskappServerURL")}/desk/${deskId}`, JSON.stringify(desk))
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/deskPUT/error", { e, desk });
        console.error(e);
        reject(e);
      });
  });
}

function deskPOST(mediumUserId, desk) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${defaultStore.get("deskappServerURL")}/desk/mediumUser/${mediumUserId}`, JSON.stringify(desk))
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/deskPOST/error", { e, mediumUserId, desk });
        console.error(e);
        reject(e);
      });
  });
}

function draftPOST(deskId, mediumPostId, draft) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${defaultStore.get("deskappServerURL")}/draft/${deskId}/${mediumPostId}`, JSON.stringify(draft))
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/draftPOST/error", { e, deskId, mediumPostId, draft });
        console.error(e);
        reject(e);
      });
  });
}

function draftsGET(deskId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${defaultStore.get("deskappServerURL")}/draft/${deskId}/list`)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/draftsGET/error", { e });
        console.error(e);
        reject(e);
      });
  });
}

async function deskSignin() {
  let mediumUser = defaultStore.get("mediumUser");
  let mediumUserJSON = defaultStore.get("mediumUserJSON");
  let desk = await deskPOST(mediumUser.id, {
    mediumUser,
    mediumUserJSON,
    lastSignin: Date.now(),
    lastSigninVersion: {
      deskVersion: defaultStore.get("deskVersion"),
      osPlatform: os.platform(),
      osRelease: os.release(),
      macAddress: defaultStore.get("macAddress"),
      debug: defaultStore.get("debug"),
    },
  });
  defaultStore.set("deskId", desk.deskId);
  defaultStore.set("deskType", desk.type);
  defaultStore.set("deskSettings", desk.settings);
  defaultStore.set("deskFlags", desk.flags);

  let draftData = await draftsGET(defaultStore.get("deskId"));
  defaultStore.set("deskDrafts", draftData.drafts);
  log("signin/desk", { desk, mediumUser, mediumUserJSON, draftData });
}

async function updateSetting(key, value) {
  let settings = defaultStore.get("deskSettings");
  settings[key] = value;
  defaultStore.set("deskSettings", settings);
  await deskPUT(defaultStore.get("deskId"), { settings });
}
function getSetting(key) {
  let settings = defaultStore.get("deskSettings") || {};
  return settings[key];
}

async function updateFlag(key, value) {
  let flags = defaultStore.get("deskFlags");
  flags[key] = value;
  defaultStore.set("deskFlags", flags);
  await deskPUT(defaultStore.get("deskId"), { flags });
}
function getFlag(key) {
  let flags = defaultStore.get("deskFlags") || {};
  return flags[key];
}

async function updateDraft(mediumPostId, lastOpenedTime) {
  let drafts = getDrafts();
  let draft = {};
  let draftIndex = -1;
  for (const [i, d] of drafts.entries()) {
    if (d.mediumPostJSON.value.id === mediumPostId) {
      draftIndex = i;
      draft = d;
    }
  }

  if (lastOpenedTime) draft.lastOpenedTime = lastOpenedTime;
  let data = await callMediumPostJSON(mediumPostId);
  if (data && data.success) {
    draft.mediumPostJSON = data.payload;
  } else {
    draft.error = data.error;
    if (data.status === 410) {
      draft.deleted = true;
    }
  }

  if (draftIndex >= 0) {
    drafts[draftIndex] = draft;
  } else {
    drafts.push(draft);
  }

  defaultStore.set("deskDrafts", drafts);

  await draftPOST(defaultStore.get("deskId"), mediumPostId, draft);

  return data;
}
function getDrafts() {
  return defaultStore.get("deskDrafts") || {};
}

function deskSignout() {
  log("desk/signout");
  session.defaultSession.clearCache().then(() => {
    session.defaultSession.clearStorageData().then(() => {
      defaultStore.clear();
      app.quit();
    });
  });
}

module.exports = {
  deskSignin,
  updateSetting,
  getSetting,
  updateFlag,
  getFlag,
  updateDraft,
  getDrafts,
  deskSignout,
};
