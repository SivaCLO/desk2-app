const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let mediumUser = defaultStore.get("medium-user");
  axios
    .post(
      "https://md-functions.azurewebsites.net/api/v2/activity?code=Qv3qRgZB1ZbBLArwzBTrF08HssguuMh7tEMSUCP3Eeakl/sIQOaaIw==",
      {
        userId: mediumUser ? mediumUser.id : "",
        activityCode,
        activityData,
        activityTime: Date.now(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.error("error in log activity", err);
    });
}

module.exports = { log };
