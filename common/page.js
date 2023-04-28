const axios = require('axios');
const { defaultStore } = require('./store');

function visit(url, title, tabId) {
  return new Promise((resolve, reject) => {
    let userId = defaultStore.get('userId');
    let sessionId = defaultStore.get('sessionId');
    axios
      .post(`${defaultStore.get('serverURL')}/page`, {
        userId,
        url,
        title,
        tabId,
        sessionId,
        visitedTime: Date.now(),
      })
      .then((res) => {
        resolve(res.data.postId);
      })
      .catch((err) => {
        console.error('Failed to record page history', err && err.code, url, tabId, sessionId);
        resolve();
      });
  });
}

function pagesGET() {
  return new Promise((resolve, reject) => {
    let userId = defaultStore.get('userId');
    axios
      .get(`${defaultStore.get('serverURL')}/page/${userId}/list`)
      .then((res) => {
        resolve(res.data.pages);
      })
      .catch((err) => {
        console.error('Failed to record page history', err && err.code);
        resolve([]);
      });
  });
}

async function getFrequent() {
  let pages = await pagesGET();
  let uniquePages = {};
  let hideLinks = [
    'https://medium.com',
    'https://medium.com/new-story',
    'https://medium.com/me/stories/drafts',
    'https://medium.com/me/stories/public',
    'https://medium.com/me/stats',
    'https://medium.com/me/design',
    'https://medium.com/me/settings',
    'https://medium.com/me/publications',
    'https://' + defaultStore.get('mediumUser').username + '.medium.com',
    'https://medium.com/@' + defaultStore.get('mediumUser').username,
  ];

  for (let page of pages) {
    let currUrl = page.url.split('?')[0];
    if (currUrl.endsWith('/')) currUrl = currUrl.substr(0, currUrl.length - 1);
    if (
      !hideLinks.includes(currUrl) &&
      !(currUrl.startsWith('https://medium.com/p') && currUrl.endsWith('/edit')) &&
      !currUrl.startsWith('file://')
    ) {
      let currPage = uniquePages[currUrl] || { url: currUrl, title: currUrl, count: 0 };
      if (page.title) {
        currPage.title = page.title;
        currPage.title = currPage.title.replace(/ [–-] Medium/, '');
      }
      if (!currPage.visitedTime || page.visitedTime > currPage.visitedTime) {
        currPage.visitedTime = page.visitedTime;
      }
      currPage.count++;
      uniquePages[currUrl] = currPage;
    }
  }

  console.log(uniquePages);

  return Object.values(uniquePages);
}

module.exports = { visit, getFrequent };
