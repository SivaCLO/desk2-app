console.log("Preload JS file loaded successfully...!");

const axios = require("axios");
const moment = require("moment");

fetchData();

async function fetchData() {
  let userObj,
    postObj,
    pageNo = 1;

  if (userObj === undefined) {
    let fetchedData = await fetchUserDetails("https://medium.com/@sivaragavan?format=json");
    userObj = fetchedData;
  }

  if (postObj === undefined) {
    let fetchedData = await fetchPostDetails(
      "https://medium.com/_/api/users/" + userObj.userId + "/profile/stream" + "?page=" + pageNo
    );
    console.log("fetchPostDetails -> fetchData -> fetchedData", fetchedData);
  }

  // console.log("fetchData -> userObj", userObj);
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

async function fetchPostDetails(url) {
  let data,
    obj,
    currentMonth = moment(new Date()).format("M"),
    currentYear = moment(new Date()).format("YYYY"),
    postDetails;
  await axios
    .get(url)
    .then(function (response) {
      data = response.data.replace("])}while(1);</x>", "");
      obj = JSON.parse(data);
      Posts = obj.payload.references.Post;
      postDetails = fetchListOfPosts(Posts, currentMonth, currentYear);
    })
    .catch(function (error) {
      console.log(error);
    });
  return postDetails;
}

function fetchListOfPosts(Posts, currentMonth, currentYear) {
  let postDetails,
    result = {};
  listOfPosts = [];
  Object.keys(Posts).forEach((key) => {
    result[key] = Posts[key];

    if (currentYear - 1 <= moment(Posts[key].latestPublishedAt).format("YYYY")) {
      if (currentMonth <= moment(Posts[key].latestPublishedAt).format("M")) {
        postDetails = {
          id: Posts[key].id,
          title: Posts[key].title,
          firstPublishedAt: Posts[key].firstPublishedAt,
          latestPublishedAt: moment(Posts[key].latestPublishedAt).format("DD MMMM YYYY"),
        };
      }
    }
    listOfPosts.push(postDetails);
  });
  // console.log("fetchListOfPosts -> listOfPosts", listOfPosts);
  return listOfPosts;
}
