console.log("Preload JS file loaded successfully...!");

const axios = require("axios");
const moment = require("moment");

fetchData();

async function fetchData() {
  let userObj,
    posts = [];

  if (userObj === undefined) {
    let fetchedData = await fetchUserDetails("https://medium.com/@sivaragavan?format=json");
    userObj = fetchedData;
  }

  if (posts.length === 0) {
    let fetchedData = await fetchPostDetails("https://medium.com/@sivaragavan?format=json");
    fetchedData.forEach((index) => {
      posts.push(index);
    });
  }

  for (let i = 0; i <= 10; i++) {
    if (posts.length !== 0) {
      let fetchedData = await fetchPostDetails(
        "https://medium.com/_/api/users/" + userObj.userId + "/profile/stream" + "?page=" + (i + 1)
      );
      fetchedData.forEach((index) => {
        posts.push(index);
      });
    }
  }

  // console.log("final fetchData -> posts", posts);
  // console.log("final length fetchData -> posts", posts.length);
  removeDuplicates(posts);
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
  console.log("fetchPostDetails -> url", url);

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
      pageLink = obj.payload.paging.path;
      nextPageNo = obj.payload.paging.next.page;
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
  return listOfPosts;
}

function removeDuplicates(posts) {
  jsonObject = posts.map(JSON.stringify);
  console.log(jsonObject);

  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  console.log(uniqueArray);
}
