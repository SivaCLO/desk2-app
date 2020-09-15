console.log("Custom JS File loaded successfully...");

window.addEventListener("load", () => {
  document.body.addEventListener("click", (event) => {
    // console.log("Dataset action events", event.target.dataset.action);
    if (
      event.target.dataset.action === "save-draft-collection" ||
      event.target.dataset.action === "overlay-confirm" ||
      event.target.dataset.action === "close"
    ) {
      hider();
    }
  });

  dividerAndPublicationHider();
});

function hider() {
  setTimeout(() => {
    if (document.getElementsByClassName("js-metabarLogoLeft").length > 0)
      document.getElementsByClassName("js-metabarLogoLeft").item(0).style.display = "none";
    if (document.getElementsByClassName("buttonSet buttonSet--wide").length > 0)
      document.getElementsByClassName("buttonSet buttonSet--wide").item(0).style.display = "none";
  }, 1500);
}

function dividerAndPublicationHider() {
  let metaBarLeft = document.getElementsByClassName("metabar-block").item(0).childNodes;
  if (metaBarLeft.length > 0) {
    if (metaBarLeft[0].className === "js-metabarLogoLeft") metaBarLeft[0].innerHTML = "";
    metaBarLeft[2].innerHTML = "";
    metaBarLeft[3].innerHTML = "";
  }
}
