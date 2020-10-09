const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let deskId = defaultStore.get("deskId") || "new";
  axios
    .post(
      defaultStore.get("debug")
        ? `http://localhost:7071/api/v1.2/activity/${deskId}`
        : `https://desk11.azurewebsites.net/api/v1.2/activity/${deskId}?code=kWmv4FSbAyDaUI1wEchMzUof8FrOgJMVG5hG/kQ2aLAPi7iis/HB4g==`,
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
