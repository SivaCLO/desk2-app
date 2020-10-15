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
        span.id = index.offset;
        span.style.cursor = "pointer";
        span.appendChild(node);
        var element = document.getElementById("suggestions");
        element.appendChild(span);
        span.addEventListener("click", () => {
          let divId = data.id;
          let misspelledWordPosition = index.offset;
          let correctWordSuggestion = i;
          setCursor(divId, misspelledWordPosition, correctWordSuggestion);
        });
      });
    });
  }
});

function setCursor(divId, misspelledWordPosition, correctWordSuggestion) {
  ipcRenderer.send("guideline-setCursor", { divId, correctWordSuggestion, misspelledWordPosition });
}
