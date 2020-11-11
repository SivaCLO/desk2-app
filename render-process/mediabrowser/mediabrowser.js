console.log("mediabrowser.js Executed Successfully...!");
const axios = require("axios");
const { ipcRenderer } = require("electron");

document.getElementById("giphy-search").addEventListener("click", async (event) => {
  var searchValue = document.getElementById("searchBox").value;
  if (searchValue === "" || searchValue === undefined) {
    document.getElementById("searchMessage").hidden = false;
  } else {
    var data = await giphy(searchValue);
    data.data.map((index) => {
      var span = document.createElement("span");
      span.setAttribute("class", "col-md-2 mt-3");
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
