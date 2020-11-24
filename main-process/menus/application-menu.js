const { Menu, app, shell, ipcMain } = require("electron");
const { getMainWindow } = require("../windows/main-window");
const { showImportDialog } = require("../dialogs/import-draft-dialog");
const { defaultStore } = require("../../common/store");
const { deskSignout } = require("../../common/desk");
const { log } = require("../../common/activity");
const path = require("path");
const { validate } = require("uuid");

let zenMode = false;

let template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Tab",
        accelerator: "CmdOrCtrl+N",
        click() {
          log("application-menu/file/new-tab");
          getMainWindow() && getMainWindow().webContents.send("new_tab");
        },
      },
      {
        label: "New Story",
        accelerator: "CmdOrCtrl+Shift+N",
        click() {
          log("application-menu/file/new-story");
          getMainWindow() && getMainWindow().webContents.send("new_tab", "https://medium.com/new-story");
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
        label: "Sign out",
        click() {
          log("application-menu/file/sign-out");
          deskSignout();
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
      {
        type: "separator",
      },
      {
        label: "Insert Media",
        accelerator: "CmdOrCtrl+Shift+M",
        click: () => {
          log("application-menu/edit/insert-media");

          // to get Current URL
          var url = getMainWindow().getBrowserView().webContents.getURL();
          console.log("url", url);
          console.log("url", typeof url);

          getMainWindow() &&
            defaultStore.set("editorURL", { url: getMainWindow().getBrowserView().webContents.getURL() });

          getMainWindow() &&
            getMainWindow()
              .getBrowserView()
              .webContents.loadURL(
                "file://" + path.join(__dirname, "../../render-process/mediabrowser/mediabrowser.html")
              );
        },
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Go Back",
        accelerator: "CmdOrCtrl+Left",
        click() {
          log("application-menu/view/back");
          getMainWindow() && getMainWindow().getBrowserView() && getMainWindow().getBrowserView().webContents.goBack();
        },
      },
      {
        label: "Go Forward",
        accelerator: "CmdOrCtrl+Right",
        click() {
          log("application-menu/view/forward");
          getMainWindow() &&
            getMainWindow().getBrowserView() &&
            getMainWindow().getBrowserView().webContents.goForward();
        },
      },
      {
        label: "Reload Tab",
        accelerator: "CmdOrCtrl+R",
        click: (item, focusedWindow) => {
          log("application-menu/view/reload");
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
        type: "separator",
      },
      {
        label: "Next Tab",
        accelerator: "Ctrl+Tab",
        click() {
          log("application-menu/view/next");
          getMainWindow() && getMainWindow().webContents.send("next-tab");
        },
      },
      {
        label: "Previous Tab",
        accelerator: "Ctrl+Shift+Tab",
        click() {
          log("application-menu/view/previous");
          getMainWindow() && getMainWindow().webContents.send("previous-tab");
        },
      },
      {
        label: "Close Tab",
        accelerator: "CmdOrCtrl+W",
        click() {
          log("application-menu/view/close");
          getMainWindow() && getMainWindow().webContents.send("close-tab");
        },
      },
      {
        label: "Reopen Last Closed Tab",
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
        label: "Zoom In",
        accelerator: "CmdOrCtrl+=",
        click: () => {
          log("application-menu/view/zoom-in");
          getMainWindow() && getMainWindow().webContents.send("zoom-in");
        },
      },
      {
        label: "Zoom Out",
        accelerator: "CmdOrCtrl+-",
        click: () => {
          log("application-menu/view/zoom-out");
          getMainWindow() && getMainWindow().webContents.send("zoom-out");
        },
      },
      {
        label: "Reset Zoom",
        accelerator: "CmdOrCtrl+0",
        click: () => {
          log("application-menu/view/reset-zoom");
          getMainWindow() && getMainWindow().webContents.send("reset-zoom");
        },
      },
      {
        type: "separator",
      },
      {
        label: "Enter Zen Mode",
        accelerator: "CmdOrCtrl+Alt+Z",
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
        label: "Toggle Full Screen",
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Ctrl+Command+F";
          } else {
            return "F11";
          }
        })(),
        click: (item, focusedWindow) => {
          log("application-menu/window/toggle-full-screen");
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
          shell.openExternal("mailto:support@cloveapps.com");
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
          app.quit();
        },
      },
    ],
  });

  addUpdateMenuItems(template[0].submenu, 1);
}

if (defaultStore.get("debug") || defaultStore.get("deskType") === "admin") {
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
        log("application-menu/window/toggle-dev-tools");
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

  ipcMain.on(`display-app-menu`, function (e, args) {
    if (defaultStore.get("mainWindowPosition") !== "darwin") {
      menu.popup({
        x: args.x,
        y: args.y,
      });
    }
  });

  ipcMain.on("zen-mode-on", () => {
    zenMode = true;
  });
  ipcMain.on("zen-mode-off", () => {
    zenMode = false;
  });
});
