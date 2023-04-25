const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let deskId = defaultStore.get("deskId") || "setup";
  axios
    .post(`${defaultStore.get("deskappServerURL")}/activity`, {
      deskId,
      activityCode,
      activityData,
      activityTime: Date.now(),
    })
    .then((res) => {})
    .catch((err) => {
      console.error("Failed to log activity", err && err.code, activityCode, activityData);
    });
}

module.exports = { log };
