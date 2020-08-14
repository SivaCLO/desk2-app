const currentWindow = require('electron').remote.getCurrentWindow()

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event)
  }
})

function handleAction (event) {
  // Update BrowserView to point to the right action
  let action = event.target.dataset.action
  if (action === 'stats' || action === 'settings') {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/${action}`)
  } else if (action === 'draft') {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`)
  } else if (action === 'published') {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/stories/public`)
  } else if (action === 'profile') {
    currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me`)
  }
}