console.log("Running Custom JS from the Desk app...");
const { ipcRenderer } = require("electron");

window.addEventListener("load", () => {
  hideMeta();
  setTimeout(() => {
    hideMeta();
    setTimeout(() => {
      hideMeta();
      setTimeout(() => {
        hideMeta();
      }, 5000);
    }, 1500);
  }, 500);

  document.body.addEventListener("click", (event) => {
    if (event.target.innerText === "Publish") {
      console.log("Publish button clicked");
    }

    if (event.target.innerText === "Publish now") {
      console.log("Publish now button clicked");
    }

    if (event.target.innerText === "Submit") {
      console.log("Submit button clicked");
    }

    if (event.target.innerText === "Submit to publication") {
      console.log("Submit to publication button clicked");
    }

    if (event.target.innerText === "Select and continue") {
      console.log("Select and continue button clicked");
    }

    if (
      event.target.dataset.action === "save-draft-collection" ||
      event.target.dataset.action === "overlay-confirm" ||
      event.target.dataset.action === "close" ||
      event.target.dataset.action === "add-to-collection"
    ) {
      hideMeta();
      setTimeout(() => {
        hideMeta();
        setTimeout(() => {
          hideMeta();
          setTimeout(() => {
            hideMeta();
          }, 5000);
        }, 1500);
      }, 500);
    }
  });

  checkContent();
});

function hideMeta() {
  let metaBarLeft = document.getElementsByClassName("metabar-block").item(0).childNodes;
  if (metaBarLeft.length > 0) {
    metaBarLeft[0].innerHTML = "";
  }
  if (metaBarLeft.length > 4) {
    metaBarLeft[1].innerHTML = "";
    metaBarLeft[2].innerHTML = "";
    metaBarLeft[3].innerHTML = "";
  }

  let buttonSet = document.getElementsByClassName("buttonSet buttonSet--wide").item(0);
  if (buttonSet) buttonSet.style.display = "none";

  let jsDoneButton = document.getElementsByClassName("js-doneButton").item(0);
  if (jsDoneButton) jsDoneButton.style.display = "none";
}

ipcRenderer.on("re-run", (event) => {
  checkContent();
});

ipcRenderer.on("publish", (event) => {
  var a = document.querySelectorAll("[data-action='show-prepublish']");
  a.item(0).click();
});

function checkContent() {
  var mediaCount = 0;
  var a = document.getElementsByClassName("section-content").item(0).children.item(0).children;

  if (a.item(0).tagName === "H3") {
    ipcRenderer.send("title", { icon: "tick", id: "titleCheckRow" });
  } else {
    ipcRenderer.send("title", { icon: "wrong", id: "titleCheckRow" });
  }

  if (a.item(1).tagName === "H4") {
    ipcRenderer.send("subTitle", { icon: "tick", id: "subTitleCheckRow" });
  } else {
    ipcRenderer.send("subTitle", { icon: "wrong", id: "subTitleCheckRow" });
  }

  if (window.location.href) {
    ipcRenderer.send("guidelines-brokenLinkCheck", {
      url: window.location.href,
    });
  }

  for (let i = 1; i <= Object.keys(a).length; i++) {
    //mediaCheck
    if (a.item(i - 1).tagName === "FIGURE") {
      mediaCount++;
    }

    if (a[i - 1].innerHTML !== "<br>") {
      //spellCheck
      ipcRenderer.send("guidelines-spellCheck", {
        id: i - 1,
        text: encodeURI(a[i - 1].innerText),
      });
    }
  }

  if (mediaCount !== 0) {
    ipcRenderer.send("image", { icon: "tick", id: "imageCheckRow" });
  } else {
    ipcRenderer.send("image", { icon: "wrong", id: "imageCheckRow" });
  }

  ipcRenderer.on("guideline-spellcheck-suggestion", (event, data) => {
    var elemId;
    elemId = data.id;
    data.suggestions.map((index) => {
      index.suggestions.map((index) => {
        console.log("suggesstion(s)", index.suggestion);
      });
    });
  });

  ipcRenderer.on("guideline-message", (event, data) => {
    setCursor(data.data.misspelledWordPosition, a, data.data.divId);
  });

  ipcRenderer.on("guideline-replace-message", (event, data) => {
    replaceWord(
      data.data.misspelledWordPosition,
      a,
      data.data.divId,
      data.data.correctWordSuggestion,
      data.data.misspelledWord
    );
  });
}

function setCursor(pos, element, elemId) {
  let sum = 0,
    cNode = "",
    cLength = [];
  var node = element.item(elemId);
  node.scrollIntoView();

  node.focus();

  for (let i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes.item(i).length !== undefined) {
      cLength.push(node.childNodes.item(i).length);
      sum = sum + node.childNodes.item(i).length;
    } else {
      cLength.push(node.childNodes.item(i).innerText.length);
      sum = sum + node.childNodes.item(i).innerText.length;
    }
    if (sum > pos) {
      if (cNode === "") {
        cNode = i;
      }
    }
  }

  for (i = 0; i < cNode; i++) {
    pos = pos - cLength[i];
  }
  var textNode = node.childNodes.item(cNode);
  var range = document.createRange();

  // insert caret after the 10th character say - pos
  range.setStart(textNode, pos);
  range.setEnd(textNode, pos + 2);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function replaceWord(pos, element, elemId, correctWord, misspelledWord) {
  var node = element.item(elemId).innerText;
  var replaced = node.replace(misspelledWord, correctWord);
  element.item(elemId).innerText = replaced;
}
