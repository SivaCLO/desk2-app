const Store = require('electron-store');
const defaultStore = new Store();

defaultStore.set(
  'serverURL',
  defaultStore.get('debug') ? `http://localhost:5050/v20` : `https://api.medium.clopilot.com/v20`
);

module.exports = { defaultStore };
