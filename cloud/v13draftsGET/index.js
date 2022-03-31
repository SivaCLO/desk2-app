const uuid = require("uuid");

module.exports = function (context, req) {
  context.res = {
    body: JSON.stringify({
      drafts: context.bindings.draftDocuments,
    }),
  };
  context.done();
};
