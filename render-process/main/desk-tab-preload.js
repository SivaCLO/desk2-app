console.log("Desk Preload Executing Successfully.");

const { defaultStore } = require("../../common/store");
const { ipcRenderer } = require("electron");

window.addEventListener("load", () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.innerText === "Sign out") {
      ipcRenderer.send("signOut");
    }
  });

  //Inserting link into the post
  var sel = window.getSelection();
  if (sel) {
    sel.focusNode.innerText = defaultStore.get("insertMediaElement").id;
  }
});
