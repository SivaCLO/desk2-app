const { BrowserWindow, Menu, app, shell, dialog, ipcMain } = require("electron");
const { openEmailSignInWindow } = require("../windows/email-signin-window");
const { showIntegrationWindow } = require("../windows/import-draft-window");
const { defaultStore } = require("../electron-store/store");
const { log } = require("../system/activity");
let currentWindow = null;
let zenMode= false;

let template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Story",
        accelerator: "CmdOrCtrl+N",
        click() {
          currentWindow && currentWindow.webContents.send('new_tab');
          log("main-menu/new-story");
        },
      },
      {
        label: "Drafts",
        accelerator: "CmdOrCtrl+D",
        click() {
          currentWindow && currentWindow.getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`);
          log("main-menu/draft");
        },
      },
      { type: "separator" },
      {
        label: "Email SignIn",
        accelerator: "Alt+Cmd+LOrCtrl+Alt+L",
        click() {
          openEmailSignInWindow();
          log("main-menu/email-signin");
        },
      },
      {
        label: "Change Medium Token",
        click() {
          showIntegrationWindow();
          log("main-menu/change-medium-token");
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        role: "undo",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        role: "selectall",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Next Story",
        accelerator: "Ctrl+Tab",
        click() {
          currentWindow && currentWindow.webContents.send('next-tab')
        },
      },
      {
        label: "Previous Story",
        accelerator: "Ctrl+Shift+Tab",
        click() {
          currentWindow && currentWindow.webContents.send('previous-tab')
        },
      },
      {
        label: "Close Story",
        accelerator: "Cmd+W",
        click() {
          currentWindow && currentWindow.webContents.send('close-tab')
        },
      },
      {
        label: "Reopen Last Closed Story",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          currentWindow && currentWindow.webContents.send('open-previously-closed-tab')
        },
      },
      {
        type: "separator",
      },
      {
        label: "Reload Tab",
        accelerator: "CmdOrCtrl+R",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            focusedWindow.getBrowserView().webContents.reload();
          }
        },
      },
      {
        label: "Reload Window",
        accelerator: "CmdOrCtrl+Shift+R",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach((win) => {
                if (win.id > 1) win.close();
              });
            }
            focusedWindow.reload();
            defaultStore.set('tabs',[])
          }
        },
      },
      {
        label: "Toggle Full Screen",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Ctrl+Command+F";
          } else {
            return "F11";
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      },
      {
        label: "Toggle Developer Tools",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Alt+Command+I";
          } else {
            return "Ctrl+Shift+I";
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.webContents.openDevTools({ mode: "undocked" });
            if (focusedWindow.getBrowserView()) {
              focusedWindow.getBrowserView().webContents &&
                focusedWindow.getBrowserView().webContents.openDevTools({ mode: "undocked" });
            }
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "Zen Mode",
        accelerator: "Alt+CmdOrCtrl+Z",
        enabled: !zenMode,
        click() {
          currentWindow && currentWindow.webContents.send('enter-zen-mode')
        },
      },
    ],
  },
  {
    label: "Window",
    role: "window",
    submenu: [
      {
        label: "Minimize",
        accelerator: "CmdOrCtrl+M",
        role: "minimize",
      },
      {
        label: "Close",
        accelerator: "CmdOrCtrl+W",
        role: "close",
      },
      {
        type: "separator",
      },
      {
        label: "Reopen Window",
        accelerator: "CmdOrCtrl+Shift+T",
        enabled: false,
        key: "reopenMenuItem",
        click: () => {
          app.emit("activate");
        },
      },
      {
        label: "Search",
        accelerator: "CmdOrCtrl+F",
        click: () => {
          currentWindow && currentWindow.webContents.send('on-find')
        },
      },
    ],
  },
  {
    label: "Help",
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: () => {
          shell.openExternal("http://electron.atom.io");
        },
      },
    ],
  },
];

function addUpdateMenuItems(items, position) {
  if (process.mas) return;

  const version = app.getVersion();
  let updateItems = [
    {
      label: `Version ${version}`,
      enabled: false,
    },
    {
      label: "Checking for Update",
      enabled: false,
      key: "checkingForUpdate",
    },
    {
      label: "Check for Update",
      visible: false,
      key: "checkForUpdate",
      click: () => {
        require("electron-updater").autoUpdater.checkForUpdates();
      },
    },
    {
      label: "Restart and Install Update",
      enabled: true,
      visible: false,
      key: "restartToUpdate",
      click: () => {
        require("electron-updater").autoUpdater.quitAndInstall();
      },
    },
  ];

  items.splice.apply(items, [position, 0].concat(updateItems));
}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  let reopenMenuItem;
  menu.items.forEach((item) => {
    if (item.submenu) {
      item.submenu.items.forEach((item) => {
        if (item.key === "reopenMenuItem") {
          reopenMenuItem = item;
        }
      });
    }
  });
  return reopenMenuItem;
}

if (process.platform === "darwin") {
  const name = app.name;
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: "about",
      },
      {
        type: "separator",
      },
      {
        label: "Services",
        role: "services",
        submenu: [],
      },
      {
        type: "separator",
      },
      {
        label: `Hide ${name}`,
        accelerator: "Command+H",
        role: "hide",
      },
      {
        label: "Hide Others",
        accelerator: "Command+Alt+H",
        role: "hideothers",
      },
      {
        label: "Show All",
        role: "unhide",
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  });

  // Window menu.
  template[3].submenu.push(
    {
      type: "separator",
    },
    {
      label: "Bring All to Front",
      role: "front",
    }
  );

  addUpdateMenuItems(template[0].submenu, 1);
}

if (process.platform === "win32") {
  const helpMenu = template[template.length - 1].submenu;
  addUpdateMenuItems(helpMenu, 0);
}

app.on("ready", () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  ipcMain.on('zen-mode-on',()=>{
    zenMode= true;
  })
  ipcMain.on('zen-mode-off',()=>{
    zenMode= false;
  })
});

app.on("browser-window-created", (event, win) => {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = false;
  currentWindow = win;
});

app.on("window-all-closed", () => {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = true;
});
