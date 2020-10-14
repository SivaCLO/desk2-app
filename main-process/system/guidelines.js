const axios = require("axios");
const { getMainWindow } = require("../windows/main-window");
const { ipcMain } = require("electron");

ipcMain.on("guidelines-spellCheck", (event, data) => {
  if (data.text !== undefined && data.text !== null && data.text !== "") {
    spellCheck(data.id, data.text);
  }
});

ipcMain.on("guidelines-brokenLinkCheck", (event, data) => {
  brokenLinkCheck(data.url);
});

ipcMain.on("guideline-setCursor", (event, data) => {
  console.log("data", data);

  getMainWindow().getBrowserView().webContents.send("guideline-message", {
    data,
  });
});

async function spellCheck(id, articleContent) {
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
        getMainWindow()
          .getBrowserView()
          .webContents.send("guideline-spellcheck-suggestion", { id: id, suggestions: response.data.flaggedTokens });
        getMainWindow().webContents.send("guideline-spellcheck-suggestion", {
          id: id,
          suggestions: response.data.flaggedTokens,
        });
      } else {
        console.log("No Suggestion Available...!");
      }
    })
    .catch((error) => {
      console.log("spellCheck -> error", error);
    });
}

function brokenLinkCheck(baseUrl) {
  console.log("brokenLinkCheck -> baseUrl", baseUrl);
}

module.exports = { spellCheck };
