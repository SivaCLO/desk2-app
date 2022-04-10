const { ipcRenderer } = require("electron");
const os = require("os");

let shortcuts = document.getElementsByClassName("container")[0].children;

for (let i = 0; i < shortcuts.length - 1; i++) {
  for (let j = 0; j < shortcuts[i].children.length - 1; j++) {
    if (os.platform() !== "darwin") {
      if (shortcuts[i].children[j].classList.contains("osx-shortcuts")) {
        shortcuts[i].children[j].remove();
      }
    } else {
      if (shortcuts[i].children[j].classList.contains("win-shortcuts")) {
        shortcuts[i].children[j].remove();
      }
    }
  }
}

document.getElementById("cancel").addEventListener("click", function () {
  ipcRenderer.send("close-shortcuts-window");
});
