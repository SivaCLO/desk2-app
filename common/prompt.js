const axios = require('axios');
const { defaultStore } = require('./store');

function postPrompt(promptId) {
  return new Promise((resolve, reject) => {
    let userId = defaultStore.get('userId');
    let sessionId = defaultStore.get('sessionId');
    axios
      .post(`${defaultStore.get('serverURL')}/prompt`, {
        userId,
        promptId,
        sessionId,
        promptTime: Date.now(),
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.error('Failed to post prompt', err && err.code, promptId, sessionId);
        resolve();
      });
  });
}

module.exports = { postPrompt };
