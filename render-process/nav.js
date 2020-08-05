const settings = require('electron-settings')

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event)
  }
})

function handleAction (event) {
  const buttons = document.querySelectorAll('.nav-button.is-selected')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected')
  })

  // Highlight clicked button and show view
  event.target.classList.add('is-selected')

  // Update BrowserView to point to the right action

}