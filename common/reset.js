const { app, session } = require("electron");
const { defaultStore } = require("./store");
const { log } = require("./activity");

function signOut() {
  log("reset/sign-out");
  session.defaultSession.clearCache().then(() => {
    session.defaultSession.clearStorageData().then(() => {
      defaultStore.clear();
      app.quit();
    });
  });
}

module.exports = { signOut };
