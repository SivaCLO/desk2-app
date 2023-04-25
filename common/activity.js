const axios = require("axios");
const { defaultStore } = require("./store");
const Config = require("../config");

function log(activityCode, activityData) {
  let deskId = defaultStore.get("deskId") || "setup";
  axios
    .post(
      defaultStore.get("debug") ? `http://localhost:5050/v20/activity` : `${Config.deskappServerURL}/v20/activity`,
      {
        deskId,
        activityCode,
        activityData,
        activityTime: Date.now(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.error("Failed to log activity", err && err.code, activityCode, activityData);
    });
}

module.exports = { log };
