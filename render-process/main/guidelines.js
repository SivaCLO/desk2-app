const { defaultStore } = require("../../common/store");

var result = defaultStore.get("spellCheckSuggesstion");
console.log("result", result);

if (result) {
  console.log("div id", result.id);
  result.suggestions.map((index) => {
    console.log("index", index);
    console.log("position", index.offset);
    index.suggestions.map((i) => {
      console.log("i", i);
      console.log("i", i.suggestion);

      var span = document.createElement("span");
      var node = document.createTextNode(i.suggestion);
      span.className = "badge badge-primary mr-1 scs";
      span.id = index.offset;
      span.style.cursor = "pointer";
      span.appendChild(node);
      var element = document.getElementById("suggestions");
      element.appendChild(span);
      span.addEventListener("click", () => {
        setCursor(index.offset);
      });
    });
  });
}

function setCursor(pos, element, elemId) {
  console.log("executing focus");
}
