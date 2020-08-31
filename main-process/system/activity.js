const axios = require("axios");

function log(activityCode, activityData) {
  axios
    .post(
      "https://md-functions.azurewebsites.net/api/activity?code=Qv3qRgZB1ZbBLArwzBTrF08HssguuMh7tEMSUCP3Eeakl/sIQOaaIw==",
      {
        userId: "172949fd7b6203109290f0ba503057336fd72a5dd91b18858155183238fafe37f",
        activityCode,
        activityData,
        activityTime: Date.now(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.log("log activity -> err", err);
    });
}

module.exports = { log };
