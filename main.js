const path = require("path");
const glob = require("glob");
const { app, session } = require("electron");
const os = require("os");
const { log } = require("./main-process/system/activity");

if (process.mas) app.setName("MediumDesk");

// Load Main Process
const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
files.forEach((file) => {
  require(file);
});

app.on("ready", () => {
  log("app/open", { "app-version": app.getVersion(), os: os.platform() });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
});
