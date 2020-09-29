console.log("Preload JS file loaded successfully...!");

let Parser = require("rss-parser");
let parser = new Parser();

(async () => {
  let feed = await parser.parseURL("https://medium.com/feed/@sivaragavan");
  // console.log(typeof feed);
  // console.log(Object.keys(feed).length);

  var listOfMonths = [];

  feed.items.forEach((item) => {
    if (item) {
      console.log("item.title", item.title);
      let monthName = item.pubDate.split(" ")[2];
      listOfMonths.push(monthName);
    }
  });
  console.log("listOfMonths", listOfMonths);

  var count = {};
  listOfMonths.forEach(function (i) {
    count[i] = (count[i] || 0) + 1;
  });
  console.log(count);
})();
