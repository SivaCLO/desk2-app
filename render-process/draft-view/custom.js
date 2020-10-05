console.log("Running Custom JS from the Desk app...");

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
