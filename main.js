const path = require("path");
const glob = require("glob");
const { app, session } = require("electron");

if (process.mas) app.setName("MediumDesk");

// Load Main Process
const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
files.forEach((file) => {
  require(file);
});

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders[
      "User-Agent"
    ] = session.defaultSession
      .getUserAgent()
      .replace("Electron/" + process.versions.electron, "");
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
});


