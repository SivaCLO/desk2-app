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
    if (a[i - 1].innerText.includes("http")) {
      console.log("String contains hyperlink");
    } else {
      ipcRenderer.send("guidelines-spellCheck", {
        id: i - 1,
        text: encodeURI(a[i - 1].innerText),
      });
    }
  }
}

ipcRenderer.on("guideline-spellcheck-suggestion", (event, data) => {
  console.log("data", data);
  console.log("guideline-spellcheck-suggestion");
});

function setCursor(pos) {
  var tag = document.getElementById("editable");

  // Creates range object
  var setpos = document.createRange();

  // Creates object for selection
  var set = window.getSelection();

  // Set start position of range
  setpos.setStart(tag.childNodes[0], pos);

  // Collapse range within its boundary points
  // Returns boolean
  setpos.collapse(true);

  // Remove all ranges set
  set.removeAllRanges();

  // Add range with respect to range object.
  set.addRange(setpos);

  // Set cursor on focus
  tag.focus();
}
