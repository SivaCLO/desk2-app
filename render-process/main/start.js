const { log } = require("../../common/activity");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

function handleAction(event) {
  let action = event.target.dataset.action;

  if (action === "open-all-drafts") {
    log("start/open-all-drafts");
    document.getElementById("content").hidden = true;
    document.getElementById("loading").hidden = false;
    window.location = "https://medium.com/me/stories/drafts";
  }
}
