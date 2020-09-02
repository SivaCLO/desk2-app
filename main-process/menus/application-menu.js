const { BrowserWindow, Menu, app, shell, ipcMain } = require("electron");
const { openEmailSignInWindow } = require("../windows/email-window");
const { showLoginWindow, logout } = require("../windows/login-window");
const { getMainWindow } = require("../windows/main-window");
const { defaultStore } = require("../../common/store");
const { log } = require("../../common/activity");
let zenMode = false;

let template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Story",
        accelerator: "CmdOrCtrl+N",
        click() {
          console.log(getMainWindow());
          getMainWindow() && getMainWindow().webContents.send("new_tab");
          log("main-menu/new-story");
        },
      },
      {
        label: "Drafts",
        accelerator: "CmdOrCtrl+D",
        click() {
          getMainWindow() &&
            getMainWindow().getBrowserView().webContents.loadURL(`https://medium.com/me/stories/drafts`);
          log("main-menu/draft");
        },
      },
      { type: "separator" },
      {
        label: "Log In via Email",
        click() {
          openEmailSignInWindow();
          log("main-menu/email-signin");
        },
      },
      {
        label: "Change Medium Token",
        click() {
          log("main-menu/change-medium-token");
          showLoginWindow();
        },
      },
      {
        label: "Log Out",
        click() {
          logout();
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
      {
        type: "separator",
      },
      {
        label: "Find in Page",
        accelerator: "CmdOrCtrl+F",
        click: () => {
          getMainWindow() && getMainWindow().webContents.send("on-find");
        },
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
          getMainWindow() && getMainWindow().webContents.send("next-tab");
        },
      },
      {
        label: "Previous Story",
        accelerator: "Ctrl+Shift+Tab",
        click() {
          getMainWindow() && getMainWindow().webContents.send("previous-tab");
        },
      },
      {
        label: "Close Story",
        accelerator: "Cmd+W",
        click() {
          getMainWindow() && getMainWindow().webContents.send("close-tab");
        },
      },
      {
        label: "Reopen Last Closed Story",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          getMainWindow() && getMainWindow().webContents.send("open-previously-closed-tab");
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
            defaultStore.set("tabs", []);
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
        label: "Enter Zen Mode",
        accelerator: "Alt+CmdOrCtrl+Z",
        click() {
          getMainWindow() && getMainWindow().webContents.send("enter-zen-mode");
        },
      },
      {
        label: "Exit Zen Mode",
        accelerator: "Esc",
        click() {
          getMainWindow() && getMainWindow().webContents.send("exit-zen-mode");
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
    ],
  },
  {
    label: "Help",
    role: "help",
    submenu: [
      {
        label: "Contact Support",
        click: () => {
          shell.openExternal("mailto:yourfriends@mediumdesk.com");
        },
      },
      {
        label: "Open Mediumdesk Website",
        click: () => {
          shell.openExternal("http://mediumdesk.com");
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
  ipcMain.on("zen-mode-on", () => {
    zenMode = true;
  });
  ipcMain.on("zen-mode-off", () => {
    zenMode = false;
  });
});
