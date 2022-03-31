const uuid = require("uuid");

module.exports = function (context, req) {
  context.res = {
    body: JSON.stringify({
      pages: context.bindings.pageDocuments,
    }),
  };
  context.done();
};
