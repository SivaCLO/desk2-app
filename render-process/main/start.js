const { log } = require("../../common/activity");
const { getDrafts, getSetting, updateDraft } = require("../../common/desk");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

refreshGoals = async () => {
  updateGoalView();
  for (let draft of getDrafts()) {
    if (!draft.deleted && !draft.mediumPostJSON.value.firstPublishedAt) {
      await updateDraft(draft.mediumPostJSON.value.id);
    }
  }
  updateGoalView();
};

window.onload = refreshGoals;
window.onfocus = refreshGoals;

function updateGoalView() {
  let drafts = getDrafts();
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let publishedCount = 0;
  let draftCount = 0;
  let monthlyGoal = getSetting("monthlyGoal");

  for (let draft of drafts) {
    if (!draft.deleted) {
      if (draft.mediumPostJSON.value.firstPublishedAt) {
        let publishedTime = new Date(draft.mediumPostJSON.value.firstPublishedAt);
        if (publishedTime.getMonth() === currentMonth && publishedTime.getFullYear() === currentYear) publishedCount++;
      } else if (draft.lastOpenedTime) {
        let lastOpenedTime = new Date(draft.lastOpenedTime);
        if (lastOpenedTime.getMonth() === currentMonth && lastOpenedTime.getFullYear() === currentYear) draftCount++;
      }
    }
  }

  let pubPercent = Math.floor((publishedCount / monthlyGoal) * 100).toString();
  document.getElementById("published").setAttribute("aria-valuenow", pubPercent);
  document.getElementById("published").setAttribute("style", "width:" + pubPercent + "%");
  let draftPercent = Math.floor((draftCount / monthlyGoal) * 100).toString();
  document.getElementById("drafts").setAttribute("aria-valuenow", draftPercent);
  document.getElementById("drafts").setAttribute("style", "width:" + draftPercent + "%");

  if (publishedCount > 0 || draftCount > 0) {
    document.getElementById("progress-text").innerText =
      (publishedCount > 1 ? publishedCount + " Stories" : publishedCount > 0 ? "1 Story" : "") +
      (publishedCount > 0 && draftCount > 0 ? " + " : "") +
      (draftCount > 1 ? draftCount + " Drafts" : draftCount > 0 ? "1 Draft" : "");
  } else {
    document.getElementById("progress-text").innerText = "No Stories";
  }
  document.getElementById("target-text").innerText = monthlyGoal + " Stories";
}

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
