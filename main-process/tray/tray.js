const path = require('path')
const {ipcMain, app, Menu, Tray} = require('electron')

let appIcon = null

app.on('browser-window-created', () => {
  const iconName = 'mediumdesk.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Exit',
    click: () => {
      app.exit()
    }
  }])

  appIcon.setContextMenu(contextMenu)
})