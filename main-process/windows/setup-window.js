const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { log } = require('../../common/activity');
const { signinSetup } = require('../../common/signin');
const { showMainWindow } = require('./main-window');
const os = require('os');
const serverURL = 'https://api.medium.clopilot.com';

let setupWindow = null;

function showSetupWindow() {
  log('setup-window/show');
  if (!setupWindow) {
    setupWindow = new BrowserWindow({
      width: 678,
      height: 695,
      frame: os.platform() === 'linux',
      autoHideMenuBar: os.platform() === 'linux',
      resizable: false,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    require('@electron/remote/main').enable(setupWindow.webContents);
    setupWindow.loadURL('file://' + path.join(__dirname, '../../render-process/setup/welcome.html')).then();

    setupWindow.webContents.on('will-redirect', (e, url) => {
      if (url.startsWith('https://medium.com/m/oauth/authorize') && url.includes('source=login')) {
        e.preventDefault();
        let urls = url.split('&source');
        setupWindow.loadURL(urls[0]).then();
      }
    });

    setupWindow.webContents.on('did-navigate', (e, url) => {
      if (url.startsWith(serverURL)) {
        signinSetup().then(() => {
          setupWindow.loadURL('file://' + path.join(__dirname, '../../render-process/setup/goal.html')).then();
        });
      }
    });

    setupWindow.on('closed', () => {
      setupWindow = null;
    });
  }
}

ipcMain.on('setup-complete', (e) => {
  showMainWindow();
  close();
});

function close() {
  if (setupWindow) {
    setupWindow.close();
  }
}

module.exports = { showSetupWindow };
