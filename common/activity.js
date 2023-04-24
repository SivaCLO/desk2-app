const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let deskId = defaultStore.get("deskId") || "setup";
  axios
    .post(
      defaultStore.get("debug")
        ? `http://localhost:5050/api/v20/activities?code=RDXNvdqM0a0OaJMu1Q1516Y3xt/a9OuWn7a3QnusIaZkr1VoIGTWJw==`
        : `https://goldfish-app-kqhm2.ondigitalocean.app/api/v20/activities?code=RDXNvdqM0a0OaJMu1Q1516Y3xt/a9OuWn7a3QnusIaZkr1VoIGTWJw==`,
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
