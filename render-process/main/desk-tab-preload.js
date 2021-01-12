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

  console.log("url", defaultStore.get("insertMediaElement").id);

  var elements = document.getElementsByClassName("section-inner").item(0).children;

  elements.item(elements.length - 1).scrollIntoView();
  var p = document.createElement("p");
  elements.item(elements.length).appendChild(p);
  elements.item(elements.length - 1).innerText =
    elements.item(elements.length - 1).innerText + " " + defaultStore.get("insertMediaElement").id;

  // if (defaultStore.get("caretPosition")) {
  //   console.log("Caret Position", { data: defaultStore.get("caretPosition") });
  //   defaultStore.set("caretPosition", null);
  // }
});

ipcRenderer.on("collect-caretPosition", (e) => {
  console.log("e", e);
  var sel = window.getSelection();
  console.log("sel", sel);
  defaultStore.set("caretPosition", sel);
});
