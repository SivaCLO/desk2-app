console.log("Preload JS file loaded successfully...!");

const axios = require("axios");
const moment = require("moment");

fetchData();

async function fetchData() {
  let userObj, postObj;

  if (userObj === undefined) {
    let fetchedData = await fetchUserDetails("https://medium.com/@sivaragavan?format=json");
    userObj = fetchedData;
  }

  console.log("fetchData -> userObj", userObj);
}

async function fetchUserDetails(url) {
  let data, obj, userObj;

  await axios
    .get(url)
    .then(function (response) {
      data = response.data.replace("])}while(1);</x>", "");
      obj = JSON.parse(data);
      userObj = {
        userId: obj.payload.user.userId,
        name: obj.payload.user.name,
        username: obj.payload.user.username,
        createdAt: obj.payload.user.createdAt,
        imageId: obj.payload.user.imageId,
        backgroundImageId: obj.payload.user.backgroundImageId,
        bio: obj.payload.user.bio,
        twitterScreenName: obj.payload.user.twitterScreenName,
        mediumMemberAt: obj.payload.user.mediumMemberAt,
        type: obj.payload.user.type,
        numberOfPostsPublished: obj.payload.userMeta.numberOfPostsPublished,
        numberOfPostsInDraft: "",
        numberOfPostsInSubmission: "",
        numberOfPublications: "",
        authorTags: obj.payload.userMeta.authorTags,
      };
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });

  return userObj;
}
