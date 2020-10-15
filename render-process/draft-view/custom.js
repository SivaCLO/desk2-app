console.log("Running Custom JS from the Desk app...");
const { ipcRenderer } = require("electron");
const { defaultStore } = require("../../common/store");

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
    console.log("event", event.target.dataset.action);
    console.log("event dataset", event.target.dataset);
    console.log("event innerText", event.target.innerText);

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

function checkContent() {
  var a = document.getElementsByClassName("section-content").item(0).children.item(0).children;

  if (a.item(0).tagName === "H3") {
    console.log("title found");
  } else {
    console.log("no title found");
  }

  if (a.item(1).tagName === "H4") {
    console.log("sub-title found");
  } else {
    console.log("no sub-title found");
  }

  if (window.location.href) {
    ipcRenderer.send("guidelines-brokenLinkCheck", {
      url: window.location.href,
    });
  }

  for (let i = 1; i <= Object.keys(a).length; i++) {
    //mediaCheck
    if (a.item(i - 1).tagName === "FIGURE") {
      console.log("Media found");
    }

    if (a[i - 1].innerText.includes("http")) {
      console.log("String contains hyperlink");
    } else {
      //spellCheck
      ipcRenderer.send("guidelines-spellCheck", {
        id: i - 1,
        text: encodeURI(a[i - 1].innerText),
      });
    }
  }

  ipcRenderer.on("guideline-spellcheck-suggestion", (event, data) => {
    var elemId;
    console.log("data", data);
    defaultStore.set("spellCheckSuggesstion", data);

    elemId = data.id;
    console.log("data.suggestions.length", data.suggestions.length);
    data.suggestions.map((index) => {
      // setCursor(index.offset, a, elemId);
      // setCursor(27, a, elemId);
      console.log("checkContent -> elemId", elemId);
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
  console.log("executing focus");

  var node = element.item(elemId);
  console.log("setCursor -> node", node);

  node.focus();
  var textNode = node.firstChild;
  var range = document.createRange();

  console.log("end location", node.innerText.indexOf(" ", pos));
  // insert caret after the 10th character say - pos
  range.setStart(textNode, pos);
  range.setEnd(textNode, node.innerText.indexOf(" ", pos));
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function replaceWord(pos, element, elemId, correctWord, misspelledWord) {
  var node = element.item(elemId).innerText;
  var replaced = node.replace(misspelledWord, correctWord);
  element.item(elemId).innerText = replaced;
}
