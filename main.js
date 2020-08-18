require("update-electron-app")({
  logger: require("electron-log"),
});

const path = require("path");
const Config = require("./config");
const glob = require("glob");
const { app, session, BrowserWindow, ipcMain } = require("electron");
const { defaultStore } = require("./main-process/electron-store/store");

const debug = /--debug/.test(process.argv[2]);

if (process.mas) app.setName("MediumDesk");

let mainWindow = null;

function initialize() {
  // Making Single Instance
  if (!process.mas) {
    app.requestSingleInstanceLock();
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }

  // Load Main Process
  const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
  files.forEach((file) => {
    require(file);
  });

  // App Events
  app.on("ready", () => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        details.requestHeaders[
          "User-Agent"
        ] = session.defaultSession
          .getUserAgent()
          .replace("Electron/" + process.versions.electron, "");
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      }
    );
    createWindow();
  });
  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

initialize();

function createWindow() {
  // Create Main Window
  const lastWindowState = defaultStore.get("lastWindowState") || Config.WINDOW_SIZE;
  const windowOptions = {
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    minWidth: 1000,
    minHeight: 600,
    title: app.name,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
    },
  };
  if (process.platform === "linux") {
    windowOptions.icon = path.join(__dirname, "/assets/app-icon/png/512.png");
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL(path.join("file://", __dirname, "/index.html"));
  mainWindow.on("resize", () => {
    mainWindow.getBrowserView().setBounds({
      x: 0,
      y: 80,
      width: mainWindow.getContentBounds().width,
      height: mainWindow.getContentBounds().height - 80,
    });
  });
  mainWindow.on("close", () => {
    if (!mainWindow.fullScreen) {
      defaultStore.set("lastWindowState", mainWindow.getBounds());
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("open_email_signin", (e, data) => {
    if (data) {
      mainWindow.getBrowserView().webContents.loadURL(data);
    }
  });
}
