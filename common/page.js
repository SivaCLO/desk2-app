const axios = require("axios");
const { defaultStore } = require("./store");

function visit(url, tabId) {
  let deskId = defaultStore.get("deskId");
  let sessionId = defaultStore.get("sessionId");
  axios
    .post(
      defaultStore.get("debug")
        ? `http://localhost:7071/api/v13/desks/${deskId}/pages`
        : `https://desk11.azurewebsites.net/api/v13/desks/${deskId}/pages?code=D9C2SEzkuxzQi8xrKKOa3l9wwx7McUxd9HbLGOToms93t3XMmSNBeA==`,
      {
        url,
        tabId,
        sessionId,
        visitedTime: Date.now(),
      }
    )
    .then((res) => {})
    .catch((err) => {
      console.error("Failed to record page history", err && err.code, url, tabId, sessionId);
    });
}

module.exports = { visit };
