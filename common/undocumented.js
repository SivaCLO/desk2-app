const { log } = require("./activity");
const axios = require("axios");
const path = require("path");

function callMediumPost(draftURL) {
  return new Promise((resolve, reject) => {
    axios
      .get(path.join(draftURL, "?format=json"))
      .then(function (response) {
        if (response.data) {
          let data = response.data.replace("])}while(1);</x>", "");
          data = JSON.parse(data);
          resolve(data);
        } else {
          log("undocumented/callMediumPost/error", { error: "Response data empty" });
          reject();
        }
      })
      .catch((e) => {
        log("undocumented/callMediumPost/error", { e });
        console.error(e);
        reject(e);
      });
  });
}

module.exports = { callMediumPost };
