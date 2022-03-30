console.log("Desk Preload Executing Successfully.");

const { ipcRenderer } = require("electron");

window.addEventListener("load", () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.innerText === "Sign out") {
      ipcRenderer.send("signOut");
    }
  });
});

ipcRenderer.on("insertGif-into-draft", (event, data) => {
  console.log("data", data.id);
});
