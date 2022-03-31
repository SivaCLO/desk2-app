const path = require("path");
const glob = require("glob");

// Load Main Process
const files = glob.sync(path.join(__dirname, "main-process/**/*.js"));
files.forEach((file) => {
  require(file);
});
