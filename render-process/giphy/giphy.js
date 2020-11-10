console.log("giphy.js Executed Successfully...!");
const axios = require("axios");

document.getElementById("giphy-search").addEventListener("click", async (event) => {
  console.log("event", event);
  var searchValue = document.getElementById("searchBox").value;
  console.log("searchValue", searchValue);
  if (searchValue === "" || searchValue === undefined) {
    document.getElementById("searchMessage").hidden = false;
  } else {
    var data = await giphy(searchValue);
    console.log("data", data);

    data.data.map((index) => {
      console.log("url", index.images.fixed_height.url);

      var span = document.createElement("span");
      span.setAttribute("class", "col-md-2 mt-3");
      var img = document.createElement("img");
      img.setAttribute("class", "img-fluid rounded");
      img.setAttribute("src", index.images.fixed_height.url);
      span.appendChild(img);
      document.getElementById("gallery").appendChild(span);
    });
  }
});

var elem = document.getElementById("gallery");

elem.addEventListener("contextmenu", (event) => {
  var selectedGIF = event.explicitOriginalTarget.src;
  console.log("selectedGIF", selectedGIF);
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
