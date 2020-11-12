console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const { ipcRenderer } = require("electron");
const { log } = require("../../common/activity");

document.getElementById("mediaItems").addEventListener("click", (event) => {
  document.getElementById("search").hidden = false;
  if (event.target.parentElement.id === "gif") document.getElementById("searchTitle").innerText = "Search GIF";
  if (event.target.parentElement.id === "screenshot")
    document.getElementById("searchTitle").innerText = "Search Screenshot";
  if (event.target.parentElement.id === "image") document.getElementById("searchTitle").innerText = "Search Image";
  if (event.target.parentElement.id === "video") document.getElementById("searchTitle").innerText = "Search Video";
  if (event.target.parentElement.id === "audio") document.getElementById("searchTitle").innerText = "Search Audio";
});

document.getElementById("searchBox").addEventListener("keyup", function () {
  if (document.getElementById("searchBox").value === "") {
    document.getElementById("media-search-button").disabled = true;
  } else {
    document.getElementById("media-search-button").disabled = false;
  }
});

document.getElementById("media-search-button").addEventListener("click", async (event) => {
  if (document.getElementById("searchTitle").innerText === "Search GIF") {
    var data = await giphy(document.getElementById("searchBox").value);
    //Clear Gallery div
    document.getElementById("gallery").innerHTML = "";

    //Insert GIFs in to the Gallery div
    data.data.map((index) => {
      var span = document.createElement("span");
      span.setAttribute("class", "col-md-2 mt-1");
      var img = document.createElement("img");
      img.setAttribute("class", "img-fluid rounded");
      img.setAttribute("src", index.images.fixed_height.url);
      img.setAttribute("id", index.url);
      span.appendChild(img);
      document.getElementById("gallery").appendChild(span);
    });

    //Show Pagination
    if (document.getElementById("gallery").innerHTML !== "") {
      document.getElementById("pagination").hidden = false;
    }

    //Set Pagination
    setPagination(Math.round(data.pagination.total_count / data.pagination.count));

    //Send selected image data
    var elem = document.getElementById("gallery");
    elem.addEventListener("contextmenu", (event) => {
      ipcRenderer.send("insertGif", { id: event.srcElement.id });
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
});

function giphy(searchValue) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://api.giphy.com/v1/gifs/search?api_key=Kql3ZWETKDvlHv7LqAoTOyJSoD8a12R7&q=${searchValue}&limit=25&offset=0&rating=g&lang=en`
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

function setPagination(pages) {
  var node = document.getElementById("pagination-item");
  node.innerHTML = "";
  var elem = createLIElement("Previous");
  node.appendChild(elem);
  for (let i = 1; i <= 3; i++) {
    var elem = createLIElement(i);
    node.appendChild(elem);
  }
  var elem = createLIElement("...");
  node.appendChild(elem);
  for (let i = pages - 3; i < pages; i++) {
    var elem = createLIElement(i);
    node.appendChild(elem);
  }
  var elem = createLIElement("Next");
  node.appendChild(elem);
}

function createLIElement(text) {
  var li = document.createElement("li");
  li.setAttribute("class", "page-item");
  var a = document.createElement("a");
  a.setAttribute("class", "page-link");
  a.innerText = text;
  li.appendChild(a);
  return li;
}
