const {screen, ipcMain} = require('electron')

ipcMain.on('get-screen-size', (event) => {
  event.sender.send('got-screen-size', screen.getPrimaryDisplay().size)
})
