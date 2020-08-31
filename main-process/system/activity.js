const axios = require("axios");

function log(activityCode, activityData) {
  axios
    .post(
      "https://md-functions.azurewebsites.net/api/activity?code=Qv3qRgZB1ZbBLArwzBTrF08HssguuMh7tEMSUCP3Eeakl/sIQOaaIw==",
      { userId: "test", activityCode, activityData, activityTime: Date.now() }
    )
    .then((res) => {})
    .catch((err) => {
      console.log("log activity -> err", err);
    });
}

module.exports = { log };
