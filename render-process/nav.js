const settings = require('electron-settings')

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event)
  }
})

function handleAction (event) {
  // Update BrowserView to point to the right action
}