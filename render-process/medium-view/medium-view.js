const Remote = require("electron").remote;
const path = require("path");

class MediumView {
  constructor() {
    this.browserView = new Remote.BrowserView({
      webPreferences: {
        allowRunningInsecureContent: true,
        preload: path.join(__dirname, "./custom.js"),
      },
    });
    this.browserView.webContents.loadURL(
      "https://medium.com/me/stories/drafts"
    );

    this.browserView.webContents.on("will-navigate", (e, url) => {
      const fromURL = this.browserView.webContents.getURL();
      if (
        url.startsWith("https://medium.com/new-story") ||
        (url.startsWith("https://medium.com/p") && url.includes("/edit"))
      ) {
        require("../tabs/tabs").newTab(url, () =>
          this.browserView.webContents.loadURL(fromURL)
        );
      }
    });

    this.browserView.webContents.on("new-window", (e, url) => {
      e.preventDefault();
      Remote.shell.openExternal(url);
    });
  }
}

module.exports = MediumView;