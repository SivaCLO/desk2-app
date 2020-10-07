const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let deskUserId = defaultStore.get("deskUserId");
  axios
    .post(
      defaultStore.get("debug")
        ? `http://localhost:7071/api/v1.2/activity/`
        : `https://desk11.azurewebsites.net/api/v1.2/activity/${
            deskUserId || "anonymous"
          }?code=kWmv4FSbAyDaUI1wEchMzUof8FrOgJMVG5hG/kQ2aLAPi7iis/HB4g==`,
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
