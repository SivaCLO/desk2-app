const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let mediumUser = defaultStore.get("medium-user");
  axios
    .post(
      (defaultStore.get("debug")
        ? "http://localhost:7071/api/activity110/"
        : "https://desk11.azurewebsites.net/api/activity110/") +
        (mediumUser ? mediumUser.username : "") +
        "?code=4fURG4n98ibd01Ovg37QE/nSe1canZCtooZl4Syn0OcLazvppagc6w==",
      {
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
