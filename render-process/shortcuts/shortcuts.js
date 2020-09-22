const { ipcRenderer } = require("electron");
const os = require("os");
var x;
var shortcutContainer = document.getElementsByClassName("container")[0].children;
for (var i = 0; i < shortcutContainer.length - 1; i++) {
  for (var j = 0; j < shortcutContainer[i].children.length - 1; j++) {
    if (os.platform() !== "darwin") {
      if (shortcutContainer[i].children[j].id === "darwincontrol") {
        x = shortcutContainer[i].children[j];
        x.innerHTML = "";
      }
    } else {
      if (shortcutContainer[i].children[j].id !== "darwincontrol") {
        x = shortcutContainer[i].children[j];
        x.innerHTML = "";
      }
    }
  }
}

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("close-shortcuts-window");
});
