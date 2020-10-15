const { defaultStore } = require("../../common/store");
const { ipcRenderer } = require("electron");

ipcRenderer.on("guideline-spellcheck-suggestion", (event, data) => {
  if (data) {
    // console.log("div id", data.id);
    data.suggestions.map((index) => {
      // console.log("index", index);
      // console.log("position", index.offset);
      index.suggestions.map((i) => {
        // console.log("i", i);
        // console.log("i", i.suggestion);

        var span = document.createElement("span");
        var node = document.createTextNode(i.suggestion);
        span.className = "badge badge-primary mr-1 scs";
        span.id = data.id + "_" + index.offset;
        span.style.cursor = "pointer";
        span.appendChild(node);
        var element = document.getElementById("suggestions");
        element.appendChild(span);
        span.addEventListener("click", () => {
          setCursor(data.id, index.offset, i);
        });
        span.addEventListener("contextmenu", (e) => {
          clearSelection();
          let id = e.target.id.split("_");
          replaceWord(id[0], id[1], e.target.innerText, index.token);
        });
      });
    });
  }
});

function setCursor(divId, misspelledWordPosition, correctWordSuggestion) {
  ipcRenderer.send("guideline-setCursor", { divId, correctWordSuggestion, misspelledWordPosition });
}

function replaceWord(divId, misspelledWordPosition, correctWordSuggestion, misspelledWord) {
  ipcRenderer.send("guideline-replaceWord", { divId, misspelledWordPosition, correctWordSuggestion, misspelledWord });
}

function clearSelection() {
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    var sel = window.getSelection();
    sel.removeAllRanges();
  }
}
