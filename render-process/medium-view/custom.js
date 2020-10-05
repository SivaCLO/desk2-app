console.log("Executing stats...!");

let listOflinks, link;

// window.scrollBy(0, document.body.scrollHeight);
setTimeout(() => {
  links = document.querySelectorAll("a");
  console.log("links", links);
  for (i = 0; i < Object.keys(links).length; i++) {
    let link = links[i].href.split("?")[0];
    if (link.includes("/p/")) {
      console.log("link", link);
      listOflinks.push(link);
    }
  }
}, 3000);
