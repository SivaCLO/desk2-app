const axios = require("axios");

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
    .get("https://desk11.cognitiveservices.azure.com/bing/v7.0/SpellCheck", {
      headers: headers,
    })
    .then((response) => {
      console.log("spellCheck -> response", response);
    })
    .catch((error) => {
      console.log("spellCheck -> error", error);
    });
}

module.exports = { spellCheck };
