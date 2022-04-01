const { ipcRenderer } = require("electron");
const { log } = require("../../common/activity");

window.addEventListener(
  "keyup",
  (e) => {
    if (e.code === "Escape") {
      ipcRenderer.send("close-quicklinks-window");
    }
    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
      arrowUpOrDownSelector(e.code);
    }
    if (e.code === "Enter") {
      let activeElement = document.getElementsByClassName("active").item(0);
      activeElement.click();
    }
  },
  true
);

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  let action = event.target.dataset.action;
  if (action === "stats") {
    log("quicklinks/stats");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/stats");
  } else if (action === "profile") {
    log("quicklinks/profile");
    ipcRenderer.send("open-quicklink", "https://medium.com/me");
  } else if (action === "settings") {
    log("quicklinks/settings");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/settings");
  } else if (action === "stories") {
    log("quicklinks/stories");
    ipcRenderer.send("open-quicklink", "https://medium.com/me/stories/public");
  } else if (action === "cancel") {
    log("quicklinks/cancel");
  }
  ipcRenderer.send("close-quicklinks-window");
}

function arrowUpOrDownSelector(keyEvent) {
  let listOfItems,
    i,
    tempArray = [],
    arrayElementIndex,
    activeElementPosition = null;
  listOfItems = document.getElementById("quicklink-list").childNodes;

  for (i = 0; i < listOfItems.length - 1; i++) {
    if (listOfItems[i].nodeName === "A") {
      if (listOfItems[i].classList.value.includes("quicklink-item")) tempArray.push(i);
      if (listOfItems[i].classList.value.includes("active")) {
        activeElementPosition = i;
      }
    }
  }

  arrayElementIndex = tempArray.indexOf(activeElementPosition);

  if (keyEvent === "ArrowUp" && arrayElementIndex !== 0) {
    listOfItems[activeElementPosition].classList.remove("active");
    listOfItems[tempArray[arrayElementIndex - 1]].classList.add("active");
  }

  if (keyEvent === "ArrowDown" && tempArray.length - 1 !== arrayElementIndex) {
    listOfItems[activeElementPosition].classList.remove("active");
    listOfItems[tempArray[arrayElementIndex + 1]].classList.add("active");
  }
}
