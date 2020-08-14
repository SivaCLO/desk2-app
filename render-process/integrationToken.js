const settings = require('electron-settings')
const currentWindow = require('electron').remote.getCurrentWindow();
const path = require('path');
const { ipcMain, ipcRenderer } = require('electron');

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event)
  }
})

function handleAction (event) {
    // Update BrowserView to point to the right action
    let action = event.target.dataset.action;
    if(action === "save_integration_token"){
        let token = document.getElementById('token').value;
      ipcRenderer.send('save_integration_token',{token});
    }
  
  }