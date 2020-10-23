const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let deskId = defaultStore.get("deskId") || "setup";
  axios
    .post(
      defaultStore.get("debug")
        ? `http://localhost:7071/api/v13/desks/${deskId}/activities`
        : `https://desk11.azurewebsites.net/api/v13/desks/${deskId}/activities?code=RDXNvdqM0a0OaJMu1Q1516Y3xt/a9OuWn7a3QnusIaZkr1VoIGTWJw==`,
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
