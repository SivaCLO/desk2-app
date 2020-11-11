console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const { ipcRenderer } = require("electron");

document.getElementById("mediaItems").addEventListener("click", (event) => {
  //   console.log("event", event);
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
