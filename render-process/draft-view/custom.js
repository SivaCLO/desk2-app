console.log("Custom JS File loaded successfully...");

window.addEventListener("load", () => {
  hideMediumLogoAndAvatar();
  hideDividerAndPublicationLogo();
  document.body.addEventListener("click", (event) => {
    console.log("Dataset action events", event.target.dataset.action);
    if (
      event.target.dataset.action === "save-draft-collection" ||
      event.target.dataset.action === "overlay-confirm" ||
      event.target.dataset.action === "close"
    ) {
      hideMediumLogoAndAvatar();
      setTimeout(() => {
        hideMediumLogoAndAvatar();
      }, 5000);
    }
    if (event.target.dataset.action === "add-to-collection") {
      hideDividerAndPublicationLogo();
      setTimeout(() => {
        hideDividerAndPublicationLogo();
      }, 5000);
    }
  });
});

function hideMediumLogoAndAvatar() {
  console.log("hideMediumLogoAndAvatar");
  if (document.getElementsByClassName("js-metabarLogoLeft").length > 0)
    document.getElementsByClassName("js-metabarLogoLeft").item(0).style.display = "none";
  if (document.getElementsByClassName("buttonSet buttonSet--wide").length > 0)
    document.getElementsByClassName("buttonSet buttonSet--wide").item(0).style.display = "none";
}

function hideDividerAndPublicationLogo() {
  console.log("hideDividerAndPublicationLogo");
  let metaBarLeft = document.getElementsByClassName("metabar-block").item(0).childNodes;
  if (metaBarLeft.length > 3) {
    metaBarLeft[0].innerHTML = "";
    metaBarLeft[1].innerHTML = "";
    metaBarLeft[2].innerHTML = "";
    metaBarLeft[3].innerHTML = "";
  }

  hideMediumLogoAndAvatar();
}
