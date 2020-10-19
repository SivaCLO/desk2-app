const { BrowserWindow, Menu, ipcMain, clipboard } = require("electron");
const { log } = require("../../common/activity");
const { getMainWindow } = require("../windows/main-window");

ipcMain.on("show-context-menu", (event, x, y, text, url) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.buildFromTemplate([
    {
      label: "Open Link in New Tab",
      visible: !!url,
      click: () => {
        log("context-menu/open-link", { url });
        getMainWindow().webContents.send("new_tab", url);
      },
    },
    {
      label: "Copy Link",
      visible: !!url,
      click: () => {
        log("context-menu/copy-link", { url });
        clipboard.writeText(url);
      },
    },
    {
      label: "Copy Text",
      visible: !!text,
      click: () => {
        log("context-menu/copy-text", { text });
        clipboard.writeText(text);
      },
    },
  ]);
  menu.popup({ window, x, y: y + 82 });
});
