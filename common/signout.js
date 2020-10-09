const { app, session } = require("electron");
const { defaultStore } = require("./store");
const { log } = require("./activity");

function signout() {
  log("signout/signout");
  session.defaultSession.clearCache().then(() => {
    session.defaultSession.clearStorageData().then(() => {
      defaultStore.clear();
      app.quit();
    });
  });
}

module.exports = { signout };
