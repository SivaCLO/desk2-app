const { log } = require("../../common/activity");
const { getDrafts, getSetting } = require("../../common/desk");

window.onload = function () {
  let drafts = getDrafts();
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let monthlyGoal = getSetting("monthlyGoal");
  let publishedCount = 0;
  let draftCount = 0;

  for (let draftId in drafts) {
    if (drafts.hasOwnProperty(draftId) && drafts[draftId].publishedTime) {
      let publishedTime = new Date(drafts[draftId].publishedTime);
      if (publishedTime.getMonth() === currentMonth && publishedTime.getFullYear() === currentYear) publishedCount++;
    } else if (drafts.hasOwnProperty(draftId) && drafts[draftId].lastOpenedTime) {
      let lastOpenedTime = new Date(drafts[draftId].lastOpenedTime);
      if (lastOpenedTime.getMonth() === currentMonth && lastOpenedTime.getFullYear() === currentYear) draftCount++;
    }
  }

  let pubPercent = Math.floor((publishedCount / monthlyGoal) * 100).toString();
  document.getElementById("published").setAttribute("aria-valuenow", pubPercent);
  document.getElementById("published").setAttribute("style", "width:" + pubPercent + "%");
  let draftPercent = Math.floor((draftCount / monthlyGoal) * 100).toString();
  document.getElementById("drafts").setAttribute("aria-valuenow", draftPercent);
  document.getElementById("drafts").setAttribute("style", "width:" + draftPercent + "%");

  document.getElementById("progress-text").innerText =
    (publishedCount > 1 ? publishedCount + " Stories, " : publishedCount > 0 ? "1 Story, " : "0 Stories, ") +
    (draftCount > 1 ? draftCount + " Drafts" : draftCount > 0 ? "1 Draft" : "0 Drafts");
  document.getElementById("target-text").innerText = monthlyGoal + " Stories";

  document.body.addEventListener("click", (event) => {
    if (event.target.dataset.action) {
      handleAction(event);
    }
  });
};

function handleAction(event) {
  let action = event.target.dataset.action;

  if (action === "new-draft") {
    log("start/new-draft");
    document.getElementById("content").hidden = true;
    document.getElementById("loading").hidden = false;
    window.location = "https://medium.com/new-story";
  } else if (action === "all-drafts") {
    log("start/all-drafts");
    document.getElementById("content").hidden = true;
    document.getElementById("loading").hidden = false;
    window.location = "https://medium.com/me/stories/drafts";
  }
}
