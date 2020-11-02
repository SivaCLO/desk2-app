console.log("Preload File executed successfully...");
const { ipcRenderer } = require("electron");
console.log("Desk Preload Executing Successfully.");
const { deskSignout } = require("../../common/desk");

ipcRenderer.on("insert-screeshot-into-draft", (e, content) => {
  const contents = new Uint8Array(content.content.content);
  var objBlob = new Blob([contents.buffer], { type: "image/png" } /* (1) */);

  const item = new ClipboardItem({
    "image/png": objBlob,
  });

  navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    if (result.state === "granted" || result.state === "prompt") {
      navigator.clipboard.write([item]).catch((ex) => {
        console.log(ex);
      });
    }
  });

  document.execCommand("paste");
});

window.addEventListener("load", () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.innerText === "Sign out") {
      ipcRenderer.send("signOut");
    }
  });
});
