const { log } = require("./activity");
const axios = require("axios");

function callMediumUserJSON(userURL) {
  return new Promise((resolve, reject) => {
    axios
      .get(userURL + "?format=json")
      .then(function (response) {
        if (response.data) {
          let data = response.data.replace("])}while(1);</x>", "");
          data = JSON.parse(data);
          if (data.success) {
            resolve(data.payload);
          } else {
            log("undocumented/callMediumUserJSON/error", { data });
            reject();
          }
        } else {
          log("undocumented/callMediumUserJSON/error", { error: "Response data empty" });
          reject();
        }
      })
      .catch((e) => {
        log("undocumented/callMediumUserJSON/error", { e });
        console.error(e);
        reject(e);
      });
  });
}

function callMediumPostJSON(mediumPostId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://medium.com/p/${mediumPostId}?format=json`)
      .then(function (response) {
        let data = response.data.replace("])}while(1);</x>", "");
        data = JSON.parse(data);
        resolve(data);
      })
      .catch((e) => {
        let data = e.response.data.replace("])}while(1);</x>", "");
        data = JSON.parse(data);
        resolve({ status: e.response.status, error: data.error });
      });
  });
}

module.exports = { callMediumUserJSON, callMediumPostJSON };
