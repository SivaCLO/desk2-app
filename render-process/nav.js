const settings = require('electron-settings')
const currentWindow = require('electron').remote.getCurrentWindow();
const path = require('path')

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event)
  }
})

function handleAction (event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action;
  if(action === 'stats' || action ==='settings'){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/${action}`)
  }else if(action === "draft"){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`)
  }else if(action === "published"){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/stories/public`)
  }else if(action === "profile"){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me`)
  }else if(action === "new"){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/new-story`)
  }else if(action === "home"){
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com`)
  }
}