console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const { ipcRenderer } = require("electron");
const { log } = require("../../common/activity");

var data;
var pnode = document.getElementById("pagination-item");

//To Update Search Title
document.getElementById("mediaItems").addEventListener("click", (event) => {
  document.getElementById("search").hidden = false;
  if (event.target.parentElement.id === "gif") document.getElementById("searchTitle").innerText = "Search GIF";
  if (event.target.parentElement.id === "screenshot")
    document.getElementById("searchTitle").innerText = "Search Screenshot";
  if (event.target.parentElement.id === "image") document.getElementById("searchTitle").innerText = "Search Image";
  if (event.target.parentElement.id === "video") document.getElementById("searchTitle").innerText = "Search Video";
  if (event.target.parentElement.id === "audio") document.getElementById("searchTitle").innerText = "Search Audio";
});

//To Disable and enable Search Button
document.getElementById("searchBox").addEventListener("keyup", function () {
  if (document.getElementById("searchBox").value === "") {
    document.getElementById("media-search-button").disabled = true;
  } else {
    document.getElementById("media-search-button").disabled = false;
  }
});

document.getElementById("media-search-button").addEventListener("click", async (event) => {
  if (document.getElementById("searchTitle").innerText === "Search GIF") {
    data = await giphy(document.getElementById("searchBox").value, 25, 0);

    //Insert GIFs into the Gallery div
    insertGif(data);

    //Set Pagination
    updatePagination(Math.round(data.pagination.total_count / data.pagination.count), 1, 1);

    //Send selected image data
    var elem = document.getElementById("gallery");
    elem.addEventListener("contextmenu", (event) => {
      ipcRenderer.send("insertGif", { id: event.srcElement.id });
    });

    showPagination();
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

  data = await giphy(document.getElementById("searchBox").value, 25, reqPage * 25 - 25);
  insertGif(data);
  updatePagination(Math.round(data.pagination.total_count / data.pagination.count), activePageNo, reqPage);
});

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
}

function showPagination() {
  if (document.getElementById("gallery").innerHTML !== "") {
    document.getElementById("pagination").hidden = false;
  }
}

function updatePagination(pages, activePageNo, reqPage) {
  pnode.innerHTML = "";
  var elem = createLIElement("Previous");
  pnode.appendChild(elem);
  for (let i = 0; i <= 5; i++) {
    var elem = createLIElement(Number(reqPage) + i);
    pnode.appendChild(elem);
  }
  var elem = createLIElement("Next");
  pnode.appendChild(elem);
  pnode.children.item(1).classList.add("active");
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
