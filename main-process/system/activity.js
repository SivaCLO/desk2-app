const axios = require("axios");

function logActivity(data) {
  return new Promise((resolve, reject) => {
    axios
      .post("http://api.mediumdesk.com:80/api/activity", data)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log("logActivity -> err", err);
      });
  });
}

module.exports = { logActivity };
