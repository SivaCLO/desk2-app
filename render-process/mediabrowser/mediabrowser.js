console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const flexImages = require("../../assets/js/flex-images");
const { log } = require("../../common/activity");

var data;

//To Update Search Title
document.getElementById("mediaItems").addEventListener("click", (event) => {
  document.getElementById("search").hidden = false;
  if (document.getElementById("search").hidden !== true) document.getElementById("search").focus();
});

document.getElementById("next").hidden = true;

var input = document.getElementById("search");

// Execute a function when the user releases a enter key on the keyboard
input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the search
    searchMedia();
  }
});

async function searchMedia() {
  data = await giphy(document.getElementById("searchBox").value, 12, 0);
  //Insert GIFs into the Gallery div
  insertGif(data);

  //Send selected image data
  var elem = document.getElementById("gallery");
  elem.addEventListener("click", (event) => {
    console.log("event", event);
    console.log({
      url: event.target.src,
      id: event.target.id,
      altText: event.target.alt,
    });
  });
}

function giphy(searchValue, limit, offset) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://api.giphy.com/v1/gifs/search?api_key=Kql3ZWETKDvlHv7LqAoTOyJSoD8a12R7&q=${searchValue}&limit=${limit}&offset=${offset}&rating=g&lang=en`
      )
      .then(function (response) {
        resolve(response.data);
      })
      .catch((e) => {
        log("desk/deskPUT/error", { e, desk });
        console.error(e);
        reject(e);
      });
  });
}

function insertGif(data) {
  //Clear Gallery div
  document.getElementById("gallery").innerHTML = "";

  data.data.map((index, i, pos) => {
    var div = document.createElement("div");
    div.setAttribute("class", "item");
    div.setAttribute("id", "galleryItem");
    div.setAttribute("data-w", index.images.original.width);
    div.setAttribute("data-h", index.images.original.height);
    var img = document.createElement("img");
    img.setAttribute("src", index.images.original.url);
    img.setAttribute("alt", index.title);
    img.setAttribute("id", index.url);
    div.appendChild(img);
    document.getElementById("gallery").appendChild(div);
  });
  new flexImages({ selector: "#gallery", rowHeight: 140, maxRows: 3 });
  document.getElementById("result").innerText = `${data.pagination.total_count} results`;
  document.getElementById("result").hidden = false;
  document.getElementById("next").hidden = false;
  if (data.pagination.offset !== 0) {
    document.getElementById("previous").hidden = false;
  } else {
    document.getElementById("previous").hidden = true;
  }
}

//Next list of items for the keyword
var nextButtton = document.getElementById("next");
nextButtton.addEventListener("click", async (event) => {
  data = await giphy(
    document.getElementById("searchBox").value,
    data.pagination.count,
    data.pagination.count + data.pagination.offset
  );
  insertGif(data);
});

var prevButton = document.getElementById("previous");
prevButton.addEventListener("click", async (event) => {
  data = await giphy(
    document.getElementById("searchBox").value,
    data.pagination.count,
    data.pagination.count - data.pagination.offset
  );
  insertGif(data);
});

// window.location = "https://google.com";
