const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { log } = require('../../common/activity');
const { postPrompt } = require('../../common/prompt');
const os = require('os');
const { getMainWindow } = require('./main-window');
const { clipboard } = require('electron');

let promptsWindow = null;

function showPromptsWindow() {
  if (!promptsWindow) {
    log('prompts-window/show');
    promptsWindow = new BrowserWindow({
      width: 200,
      height: 264,
      frame: os.platform() === 'linux',
      autoHideMenuBar: os.platform() === 'linux',
      resizable: false,
      alwaysOnTop: true,
      fullscreen: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        spellcheck: false,
        enableRemoteModule: true,
      },
    });
    require('@electron/remote/main').enable(promptsWindow.webContents);
    promptsWindow.loadURL('file://' + path.join(__dirname, '../../render-process/prompts/prompts.html')).then();
    promptsWindow.on('closed', () => {
      promptsWindow = null;
    });
  }
}

function closePromptsWindow() {
  log('prompts-window/close');
  promptsWindow.close();
  promptsWindow = null;
}

ipcMain.on('send-prompt', async (e, promptId) => {
  log('prompts-window/send-prompt');
  let choices = await postPrompt(promptId);
  console.log('Test', choices[0].message.content);
  clipboard.writeText(choices[0].message.content);
});

ipcMain.on('open-prompts-window', () => {
  showPromptsWindow();
});

ipcMain.on('close-prompts-window', () => {
  closePromptsWindow();
});

module.exports = { showPromptsWindow };
