copyLinkToClipboard = () => {
  console.log("copyLinkToClipboard executing");

  var str = document.getElementById("draft-tools-title").innerText;
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  alert(`Copied: ${str}`);
};
