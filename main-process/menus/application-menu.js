const { Menu, app, shell, ipcMain } = require("electron");
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
          log("application-menu/file/new-story");
          getMainWindow() && getMainWindow().webContents.send("new_tab");
        },
      },
      {
        label: "Import Story",
        accelerator: "Shift+CmdOrCtrl+I",
        click() {
          log("application-menu/file/import-story");
          showImportDialog();
        },
      },
      { type: "separator" },
      {
        label: "Sign In via Email",
        click() {
          log("application-menu/file/email-signin");
          showEmailWindow();
        },
      },
      {
        label: "Sign Out",
        click() {
          log("application-menu/file/signout");
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
          log("application-menu/edit/find-in-page");
          getMainWindow() && getMainWindow().webContents.send("on-find");
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
          log("application-menu/view/open-drafts");
          getMainWindow() && getMainWindow().webContents.send("load-drafts");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Next Story",
        accelerator: "Ctrl+Tab",
        click() {
          log("application-menu/view/next-story");
          getMainWindow() && getMainWindow().webContents.send("next-tab");
        },
      },
      {
        label: "Previous Story",
        accelerator: "Ctrl+Shift+Tab",
        click() {
          log("application-menu/view/previous-story");
          getMainWindow() && getMainWindow().webContents.send("previous-tab");
        },
      },
      {
        label: "Close Story",
        accelerator: "CmdOrCtrl+W",
        click() {
          log("application-menu/view/close-story");
          getMainWindow() && getMainWindow().webContents.send("close-tab");
        },
      },
      {
        label: "Reload Story",
        accelerator: "CmdOrCtrl+R",
        click: (item, focusedWindow) => {
          log("application-menu/view/reload-story", { focusedWindow });
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.getBrowserView()) {
              focusedWindow.getBrowserView().webContents.reload();
            } else {
              focusedWindow.webContents.reload();
            }
          }
        },
      },
      {
        label: "Reopen Last Closed Story",
        accelerator: "CmdOrCtrl+Shift+T",
        click() {
          log("application-menu/view/reopen-last-closed-story");
          getMainWindow() && getMainWindow().webContents.send("open-previously-closed-tab");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Enter Zen Mode",
        accelerator: "Alt+CmdOrCtrl+Z",
        click() {
          log("application-menu/view/enter-zen-mode");
          getMainWindow() && getMainWindow().webContents.send("enter-zen-mode");
        },
      },
      {
        label: "Exit Zen Mode",
        accelerator: "Esc",
        click() {
          log("application-menu/view/exit-zen-mode");
          getMainWindow() && getMainWindow().webContents.send("exit-zen-mode");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Show Keyboard Shortcuts",
        accelerator: "CmdOrCtrl+/",
        click: () => {
          log("application-menu/view/show-shortcuts");
          toggleShortcutsWindow();
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
          log("application-menu/window/reload-window", { focusedWindow });
          if (focusedWindow) {
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
          log("application-menu/window/toggle-full-screen", { focusedWindow });
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
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
          log("application-menu/help/contact-support");
          shell.openExternal("mailto:yourfriends@thedesk.co");
        },
      },
      {
        label: "Open TheDesk.co",
        click: () => {
          log("application-menu/help/open-thedesk-co");
          shell.openExternal("http://thedesk.co");
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
        log("application-menu/app/check-for-update");
        require("electron-updater").autoUpdater.checkForUpdates();
      },
    },
    {
      label: "Restart and Install Update",
      enabled: true,
      visible: false,
      key: "restartToUpdate",
      click: () => {
        log("application-menu/app/restart-for-update");
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
          log("application-menu/app/quit");
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

if (/--debug/.test(process.argv[2])) {
  template[template.length - 2].submenu.push(
    {
      type: "separator",
    },
    {
      label: "Show Developer Tools",
      accelerator: (() => {
        if (process.platform === "darwin") {
          return "Alt+Command+I";
        } else {
          return "Ctrl+Shift+I";
        }
      })(),
      click: (item, focusedWindow) => {
        log("application-menu/window/toggle-dev-tools", { focusedWindow });
        if (focusedWindow) {
          focusedWindow.webContents.openDevTools({ mode: "undocked" });
          if (focusedWindow.getBrowserView()) {
            focusedWindow.getBrowserView().webContents &&
              focusedWindow.getBrowserView().webContents.openDevTools({ mode: "undocked" });
          }
        }
      },
    }
  );
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
