const axios = require("axios");
const { defaultStore } = require("./store");

function log(activityCode, activityData) {
  let mediumUser = defaultStore.get("medium-user");
  let debug = defaultStore.get("debug");
  if (debug) {
    console.log({
      userId: mediumUser ? mediumUser.id : "",
      userName: mediumUser ? mediumUser.username : "",
      activityCode,
      activityData,
      activityTime: Date.now(),
    });
  } else {
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
        console.error("Failed to log activity", err && err.code, activityCode, activityData);
      });
  }
}

module.exports = { log };
