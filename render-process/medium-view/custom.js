console.log("Executing Preload in medium view JS");

window.addEventListener("contextmenu", (event) => {
  // console.log("event",event);
  for (let i = 0; i < Object.keys(event.path).length - 1; i++) {
    if (event.path[i].nodeName === "A") {
      var url = event.path[i].href.split("?")[0];
      console.log("URL", url);

      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }
});
