const { app, session } = require('electron');
const { defaultStore } = require('./store');
const { log } = require('./activity');
const { callMediumPostJSON } = require('./undocumented');
const axios = require('axios');
const os = require('os');

function userPUT(userId, user) {
  return new Promise((resolve, reject) => {
    axios
      .put(`${defaultStore.get('serverURL')}/user/${userId}`, user)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log('user/userPUT/error', { e, user });
        console.error(e);
        reject(e);
      });
  });
}

function userPOST(mediumUserId, user) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${defaultStore.get('serverURL')}/user/mediumUser/${mediumUserId}`, user)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log('user/userPOST/error', { e, mediumUserId, user });
        console.error(e);
        reject(e);
      });
  });
}

function draftPOST(userId, mediumPostId, draft) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${defaultStore.get('serverURL')}/draft/${userId}/${mediumPostId}`, draft)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log('user/draftPOST/error', { e, userId, mediumPostId, draft });
        console.error(e);
        reject(e);
      });
  });
}

function draftsGET(userId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${defaultStore.get('serverURL')}/draft/${userId}/list`)
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log('user/draftsGET/error', { e });
        console.error(e);
        reject(e);
      });
  });
}

async function userSignin() {
  let mediumUser = defaultStore.get('mediumUser');
  let mediumUserJSON = defaultStore.get('mediumUserJSON');
  let user = await userPOST(mediumUser.id, {
    mediumUser,
    mediumUserJSON,
    lastSignin: Date.now(),
    lastSigninVersion: {
      appVersion: defaultStore.get('appVersion'),
      osPlatform: os.platform(),
      osRelease: os.release(),
      macAddress: defaultStore.get('macAddress'),
      debug: defaultStore.get('debug'),
    },
  });
  defaultStore.set('userId', user.userId);
  defaultStore.set('userType', user.type);
  defaultStore.set('userSettings', user.settings);
  defaultStore.set('userFlags', user.flags);

  let draftData = await draftsGET(defaultStore.get('userId'));
  defaultStore.set('userDrafts', draftData.drafts);
  log('signin/user', { user, mediumUser, mediumUserJSON, draftData });
}

async function updateSetting(key, value) {
  let settings = defaultStore.get('userSettings');
  settings[key] = value;
  defaultStore.set('userSettings', settings);
  await userPUT(defaultStore.get('userId'), { settings });
}
function getSetting(key) {
  let settings = defaultStore.get('userSettings') || {};
  return settings[key];
}

async function updateFlag(key, value) {
  let flags = defaultStore.get('userFlags');
  flags[key] = value;
  defaultStore.set('userFlags', flags);
  await userPUT(defaultStore.get('userId'), { flags });
}
function getFlag(key) {
  let flags = defaultStore.get('userFlags') || {};
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

  defaultStore.set('userDrafts', drafts);

  await draftPOST(defaultStore.get('userId'), mediumPostId, draft);

  return data;
}
function getDrafts() {
  return defaultStore.get('userDrafts') || {};
}

function userSignout() {
  log('user/signout');
  session.defaultSession.clearCache().then(() => {
    session.defaultSession.clearStorageData().then(() => {
      defaultStore.clear();
      app.quit();
    });
  });
}

module.exports = {
  userSignin,
  updateSetting,
  getSetting,
  updateFlag,
  getFlag,
  updateDraft,
  getDrafts,
  userSignout,
};
