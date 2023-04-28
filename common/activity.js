const axios = require('axios');
const { defaultStore } = require('./store');

function log(activityCode, activityData) {
  let userId = defaultStore.get('userId') || 'setup';
  axios
    .post(`${defaultStore.get('serverURL')}/activity`, {
      userId,
      activityCode,
      activityData,
      activityTime: Date.now(),
    })
    .then((res) => {})
    .catch((err) => {
      console.error('Failed to log activity', err && err.code, activityCode, activityData);
    });
}

module.exports = { log };
