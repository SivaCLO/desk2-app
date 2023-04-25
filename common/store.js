const Store = require("electron-store");
const defaultStore = new Store();

defaultStore.set(
  "deskappServerURL",
  defaultStore.get("debug") ? `http://localhost:5050/v20` : `https://api.desk.clove.pro/20`
);

module.exports = { defaultStore };
