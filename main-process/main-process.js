const { app, ipcMain } = require('electron');
const os = require('os');
const { log } = require('../common/activity');
const { checkForUpdates } = require('./system/updater');
const { showMainWindow, getMainWindow } = require('./windows/main-window');
const { showSetupWindow } = require('./windows/setup-window');
const { signinMain } = require('../common/signin');
const { defaultStore } = require('../common/store');
const { getFlag, userSignout } = require('../common/user');
const debug = /--inspect/.test(process.argv[2]);
const macAddress = require('macaddress');
require('@electron/remote/main').initialize();

defaultStore.set('debug', debug);
defaultStore.set('appVersion', app.getVersion());
defaultStore.delete('downloadedVersion');

macAddress.one(function (err, address) {
  macAddress && defaultStore.set('macAddress', address);
});

if (process.mas) app.setName('CLOPilot for Medium');

app.on('ready', () => {
  log('main-process/app/ready', {
    appVersion: app.getVersion(),
    osPlatform: os.platform(),
    osRelease: os.release(),
    macAddress: defaultStore.get('macAddress'),
    debug,
  });

  checkForUpdates();

  if (!getFlag('setupCompleted')) {
    showSetupWindow();
  } else {
    signinMain().then(() => {
      showMainWindow();
    });
  }
});

app.on('activate', () => {
  log('main-process/app/activate');

  checkForUpdates();

  if (!getFlag('setupCompleted')) {
    showSetupWindow();
  } else {
    signinMain().then(() => {
      showMainWindow();
    });
  }
});

app.on('session-created', (session) => {
  const userAgent = session.getUserAgent();
  session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''));
});

if (!process.mas) {
  app.requestSingleInstanceLock();
  app.on('second-instance', () => {
    if (getMainWindow()) {
      if (getMainWindow().isMinimized()) getMainWindow().restore();
      getMainWindow().focus();
    }
  });
}

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('signOut', (event) => {
  userSignout();
});
