const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
  document.body.addEventListener('click', (event) => {
    if (event.target.innerText === 'Sign out') {
      ipcRenderer.send('signOut');
    }
  });
});
