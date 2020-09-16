const shell = require("electron").shell;
const { log } = require("../common/activity");

const links = document.querySelectorAll("a[href]");

Array.prototype.forEach.call(links, (link) => {
  const url = link.getAttribute("href");
  if (url.indexOf("http") === 0) {
    link.addEventListener("click", (e) => {
      log("ex-links/open", url);
      e.preventDefault();
      shell.openExternal(url);
    });
  }
});
