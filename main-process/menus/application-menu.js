const { BrowserWindow, Menu, app, shell, ipcMain } = require("electron");
const { showEmailWindow } = require("../windows/email-window");
const { logout } = require("../windows/login-window");
const { getMainWindow } = require("../windows/main-window");
const { toggleShortcutsWindow } = require("../windows/shortcuts-window");
const { showImportDialog } = require("../dialogs/import-draft-dialog");
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
          getMainWindow() && getMainWindow().webContents.send("new_tab");
          log("main-menu/new-story");
        },
      },
      {
        label: "Import Story",
        accelerator: "Shift+CmdOrCtrl+I",
        click() {
          showImportDialog();
          log("main-menu/import-story");
        },
      },
      { type: "separator" },
      {
        label: "Sign In via Email",
        click() {
          showEmailWindow();
          log("main-menu/email-signin");
        },
      },
      {
        label: "Sign Out",
        click() {
          logout();
          log("main-menu/signout");
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
          log("edit-menu/find-in-page");
        },
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Open Drafts",
        accelerator: "CmdOrCtrl+D",
        click() {
          getMainWindow() && getMainWindow().webContents.send("load-drafts");
          log("main-menu/drafts");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Next Story",
        accelerator: "Ctrl+Tab",
        click() {
          getMainWindow() && getMainWindow().webContents.send("next-tab");
          log("view-menu/next-story");
        },
      },
      {
        label: "Previous Story",
        accelerator: "Ctrl+Shift+Tab",
        click() {
          getMainWindow() && getMainWindow().webContents.send("previous-tab");
          log("view-menu/previous-story");
        },
      },
      {
        label: "Close Story",
        accelerator: "CmdOrCtrl+W",
        click() {
          getMainWindow() && getMainWindow().webContents.send("close-tab");
          log("view-menu/close-story");
        },
      },
      {
        label: "Reload Story",
        accelerator: "CmdOrCtrl+R",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.getBrowserView()) {
              focusedWindow.getBrowserView().webContents.reload();
            } else {
              focusedWindow.webContents.reload();
            }
          }
          log("view-menu/reload-story");
        },
      },
      {
        label: "Reopen Last Closed Story",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          getMainWindow() && getMainWindow().webContents.send("open-previously-closed-tab");
          log("view-menu/reopen-last-closed-story");
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
          log("view-menu/enter-zen-mode");
        },
      },
      {
        label: "Exit Zen Mode",
        accelerator: "Esc",
        click() {
          getMainWindow() && getMainWindow().webContents.send("exit-zen-mode");
          log("view-menu/exit-zen-mode");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Show Keyboard Shortcuts",
        accelerator: "CmdOrCtrl+/",
        click: () => {
          toggleShortcutsWindow();
          log("main-menu/shortcuts-window");
        },
      },
    ],
  },
  {
    label: "Window",
    role: "window",
    submenu: [
      {
        label: "Minimize Window",
        accelerator: "CmdOrCtrl+M",
        role: "minimize",
      },
      {
        label: "Reload Window",
        accelerator: "CmdOrCtrl+Shift+R",
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
            defaultStore.set("tabs", []);
          }
        },
      },
      {
        type: "separator",
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
          log("view-menu/toggle-full-screen");
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
    ],
  },
  {
    label: "Help",
    role: "help",
    submenu: [
      {
        label: "Contact Support",
        click: () => {
          shell.openExternal("mailto:yourfriends@thedesk.co");
          log("help-menu/contact-support");
        },
      },
      {
        label: "Open TheDesk.co",
        click: () => {
          shell.openExternal("http://thedesk.co");
          log("help-menu/view-home-page");
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
        log("app/check-for-update");
      },
    },
    {
      label: "Restart and Install Update",
      enabled: true,
      visible: false,
      key: "restartToUpdate",
      click: () => {
        require("electron-updater").autoUpdater.quitAndInstall();
        log("app/restart-for-update");
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
          app.exit(0);
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
