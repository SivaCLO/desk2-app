const axios = require("axios");
const { ipcMain } = require("electron");

ipcMain.on("guidelines-spellcheck", (event, data) => {
  spellCheck(data.text);
});

function spellCheck(articleContent) {
  console.log("spellCheck -> articleContent", articleContent);
  console.log("Executing Spell Check");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Content-Security-Policy": ["default-src 'none'"],
    "Ocp-Apim-Subscription-Key": "905db2f9b4a04b3aa2eb9fcd93025644",
  };
  axios
    .get("https://desk11.cognitiveservices.azure.com/bing/v7.0/SpellCheck?text=" + articleContent + "&mkt=en-US", {
      headers: headers,
    })
    .then((response) => {
      if (Object.keys(response.data.flaggedTokens).length !== 0) {
        console.log("Suggestion Available...!");
        console.log("spellCheck -> response", response.data.flaggedTokens);
      } else {
        console.log("No Suggestion Available...!");
      }
    })
    .catch((error) => {
      console.log("spellCheck -> error", error);
    });
}

module.exports = { spellCheck };
