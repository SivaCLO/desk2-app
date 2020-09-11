const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let mediumUser = defaultStore.get("medium-user");
  axios
    .post(
      "https://thedeskfunctions.azurewebsites.net/api/v2/activity?code=IrAqkRQLaEBPrRzrr6u5WUoHtKQcTJwmOlgaHZNDhSPwxJ0zQw0A4w==",
      {
        userId: mediumUser ? mediumUser.id : "",
        userName: mediumUser ? mediumUser.username : "",
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
