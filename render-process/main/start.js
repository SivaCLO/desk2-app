const { log } = require("../../common/activity");
const { getFrequent } = require("../../common/page");
const { defaultStore } = require("../../common/store");
const { getDrafts, getSetting, updateDraft } = require("../../common/desk");

document.body.addEventListener("click", (event) => {
  const origin = event.target.closest("a");
  if (origin && origin.href) {
    event.preventDefault();
    handleLinks(origin.href);
  }
});

function handleLinks(url) {
  log("start/link-clicked");
  document.getElementById("content").hidden = true;
  document.getElementById("loading").hidden = false;
  window.location = url;
}

function updateGoalView(drafts) {
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
    document.getElementById("progress-text").innerHTML =
      (publishedCount > 1
        ? publishedCount + " Published <span class='text-success'>&#x2014;</span>"
        : publishedCount > 0
        ? "1 Published <span class='text-success'>&#x2014;</span>"
        : "") +
      (publishedCount > 0 && draftCount > 0 ? "&nbsp;&nbsp;&nbsp;" : "") +
      (draftCount > 1
        ? draftCount + " Drafts <span class='text-warning'>&#x2014;</span>"
        : draftCount > 0
        ? "1 Draft <span class='text-warning'>&#x2014;</span>"
        : "");
  } else {
    document.getElementById("progress-text").innerText = "No Stories";
  }
  document.getElementById("target-text").innerText = monthlyGoal + " Stories";
}

updateDraftsView = (drafts) => {
  document.getElementById("recentDrafts").innerHTML = "";

  drafts = drafts.filter(function (a) {
    return !a.deleted && !a.mediumPostJSON.value.firstPublishedAt;
  });

  drafts = drafts.sort(function (a, b) {
    if (a.lastOpenedTime < b.lastOpenedTime) {
      return 1;
    } else if (a.lastOpenedTime > b.lastOpenedTime) {
      return -1;
    }
    return 0;
  });

  for (let draft of drafts.slice(0, 5)) {
    if (!draft.deleted && !draft.mediumPostJSON.value.firstPublishedAt) {
      let div = document.createElement("div");
      div.classList.add("row");
      div.innerHTML = `
        <a href="https://medium.com/p/${draft.mediumPostJSON.value.id}/edit" class="col-12 link-title mt-3 font-weight-bold text-nowrap text-truncate">${draft.mediumPostJSON.value.title}</a>
        <a href="https://medium.com/p/${draft.mediumPostJSON.value.id}/edit" class="col-12 link text-nowrap text-truncate">https://medium.com/p/${draft.mediumPostJSON.value.id}/edit</a>
      `;
      document.getElementById("recentDrafts").appendChild(div);
    }
  }
};

refreshDrafts = async () => {
  let drafts = getDrafts();
  updateGoalView(drafts);
  updateDraftsView(drafts);
  for (let draft of drafts) {
    if (!draft.deleted && !draft.mediumPostJSON.value.firstPublishedAt) {
      await updateDraft(draft.mediumPostJSON.value.id);
    }
  }
  drafts = getDrafts();
  updateGoalView(drafts);
  updateDraftsView(drafts);
};

refreshFrequent = async () => {
  let pages = await getFrequent();
  document.getElementById("frequentLinks").innerHTML = "";

  pages = pages.sort(function (a, b) {
    if (a.count < b.count) {
      return 1;
    } else if (a.count > b.count) {
      return -1;
    }
    return 0;
  });

  for (let page of pages.slice(0, 5)) {
    let div = document.createElement("div");
    div.classList.add("row");
    div.innerHTML = `
      <a href="${page.url}" class="col-12 link-title mt-3 font-weight-bold text-nowrap text-truncate">${page.title}</a>
      <a href="${page.url}" class="col-12 link text-nowrap text-truncate">${page.url}</a>
      `;
    document.getElementById("frequentLinks").appendChild(div);
  }
};

refresh = async () => {
  let mediumUser = defaultStore.get("mediumUser");
  let avatarEl = document.getElementById("avatar");
  avatarEl.innerHTML = `<img src="${mediumUser.imageUrl}"/>`;
  refreshDrafts().then();
  refreshFrequent().then();
};

window.onload = refresh;
window.onfocus = refresh;

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
