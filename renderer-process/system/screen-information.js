const {ipcRenderer} = require('electron')

const screenInfoBtn = document.getElementById('screen-info')

screenInfoBtn.addEventListener('click', () => {
  ipcRenderer.send('get-screen-size')
})

ipcRenderer.on('got-screen-size', (event, size) => {
  const message = `Your screen is: ${size.width}px x ${size.height}px`
  document.getElementById('got-screen-info').innerHTML = message
})
