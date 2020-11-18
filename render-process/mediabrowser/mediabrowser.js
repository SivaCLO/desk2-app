console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const { ipcRenderer } = require("electron");
const flexImages = require("../../assets/js/flex-images");
const { log } = require("../../common/activity");

var data;
var pnode = document.getElementById("pagination-item");

//To Update Search Title
document.getElementById("mediaItems").addEventListener("click", (event) => {
  document.getElementById("search").hidden = false;
  document.getElementById("search").focus();
  if (event.target.parentElement.id === "gif") document.getElementById("searchTitle").innerText = "Search GIF";
  if (event.target.parentElement.id === "screenshot")
    document.getElementById("searchTitle").innerText = "Search Screenshot";
  if (event.target.parentElement.id === "image") document.getElementById("searchTitle").innerText = "Search Image";
  if (event.target.parentElement.id === "video") document.getElementById("searchTitle").innerText = "Search Video";
  if (event.target.parentElement.id === "audio") document.getElementById("searchTitle").innerText = "Search Audio";
});

document.getElementById("next").hidden = true;

//To Disable and enable Search Button
document.getElementById("searchBox").addEventListener("keyup", function () {
  if (document.getElementById("searchBox").value === "") {
    document.getElementById("media-search-button").disabled = true;
  } else {
    document.getElementById("media-search-button").disabled = false;
  }
});

var input = document.getElementById("search");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("media-search-button").click();
  }
});

document.getElementById("media-search-button").addEventListener("click", async (event) => {
  searchMedia();
});

//Pagination click event handler
pnode.addEventListener("click", async (event) => {
  var activePageNo,
    reqPage = "",
    pageList;

  if (event.target.innerText) {
    pageList = pnode.children;
    reqPage = Object.keys(pageList).map(function (key, index) {
      var elem = pageList[key];
      if (elem.classList.contains("active")) {
        activePageNo = elem.innerText;
      }
    });

    if (event.target.innerText === "Next") {
      reqPage = Number(activePageNo) + 1;
    }

    if (event.target.innerText === "Previous") {
      reqPage = Number(activePageNo) - 1;
    }

    if (event.target.innerText) {
      reqPage = event.target.innerText;
    }
  }

  data = await giphy(document.getElementById("searchBox").value, 12, reqPage * 12 - 12);
  insertGif(data);
});

async function searchMedia() {
  if (document.getElementById("searchTitle").innerText === "Search GIF") {
    data = await giphy(document.getElementById("searchBox").value, 12, 0);
    //Insert GIFs into the Gallery div
    insertGif(data);

    //Send selected image data
    var elem = document.getElementById("gallery");
    elem.addEventListener("dblclick", (event) => {
      console.log("event", event);

      ipcRenderer.send("insertGif", { id: event.target.id });
      $("#Modal").modal("show");
      var modalbody = document.getElementsByClassName("modal-body");
      modalbody.item(0).innerText = "";
      var img = document.createElement("img");
      img.setAttribute("src", event.target.src);
      img.setAttribute("class", "img-fluid rounded");
      modalbody.item(0).appendChild(img);
    });
  }

  if (document.getElementById("searchTitle").innerText === "Search Screenshot") {
    console.log(document.getElementById("searchTitle").innerText);
  }
  if (document.getElementById("searchTitle").innerText === "Search Image") {
    console.log(document.getElementById("searchTitle").innerText);
  }
  if (document.getElementById("searchTitle").innerText === "Search Video") {
    console.log(document.getElementById("searchTitle").innerText);
  }
  if (document.getElementById("searchTitle").innerText === "Search Audio") {
    console.log(document.getElementById("searchTitle").innerText);
  }
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
    div.setAttribute("data-w", index.images.original.width);
    div.setAttribute("data-h", index.images.original.height);
    var img = document.createElement("img");
    img.setAttribute("src", index.images.original.url);
    img.setAttribute("alt", index.title);
    div.appendChild(img);
    document.getElementById("gallery").appendChild(div);
  });
  new flexImages({ selector: "#gallery", rowHeight: 140 });
  document.getElementById("result").innerText = `${data.pagination.total_count} results`;
  document.getElementById("next").hidden = false;
}

var nextButtton = document.getElementById("next");
nextButtton.addEventListener("click", async (event) => {
  data = await giphy(
    document.getElementById("searchBox").value,
    data.pagination.count,
    data.pagination.count + data.pagination.offset
  );
  insertGif(data);
});
