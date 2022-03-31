const uuid = require("uuid");

module.exports = function (context, req) {
  if (context.bindings.draftDocument && context.bindings.draftDocument.length > 0) {
    context.bindings.newDraftDocument = context.bindings.draftDocument[0];
  } else {
    context.bindings.newDraftDocument = {
      id: uuid.v4(),
      deskId: context.bindingData.deskId,
      mediumPostId: context.bindingData.mediumPostId,
      createdTime: Date.now(),
    };
  }

  req.body.error && (context.bindings.newDraftDocument.error = req.body.error);
  req.body.deleted && (context.bindings.newDraftDocument.deleted = req.body.deleted);
  req.body.openedTime && (context.bindings.newDraftDocument.openedTime = req.body.openedTime);
  req.body.lastOpenedTime && (context.bindings.newDraftDocument.lastOpenedTime = req.body.lastOpenedTime);
  req.body.mediumPostJSON && (context.bindings.newDraftDocument.mediumPostJSON = req.body.mediumPostJSON);

  context.res = {
    body: JSON.stringify({
      id: context.bindings.newDraftDocument.id,
    }),
  };
  context.done();
};
