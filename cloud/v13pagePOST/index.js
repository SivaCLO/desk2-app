const uuid = require("uuid");

module.exports = function (context, req) {
  if (context.bindings.pageDocument && context.bindings.pageDocument.length > 0) {
    context.bindings.newPageDocument = context.bindings.pageDocument[0];
  } else {
    context.bindings.newPageDocument = {
      id: uuid.v4(),
      deskId: context.bindingData.deskId,
    };
  }

  req.body.url && (context.bindings.newPageDocument.url = req.body.url);
  req.body.title && (context.bindings.newPageDocument.title = req.body.title);
  req.body.tabId && (context.bindings.newPageDocument.tabId = req.body.tabId);
  req.body.sessionId && (context.bindings.newPageDocument.sessionId = req.body.sessionId);
  req.body.visitedTime && (context.bindings.newPageDocument.visitedTime = req.body.visitedTime);

  if (context.bindings.deskDocument[0]) {
    context.bindings.newDeskDocument = context.bindings.deskDocument[0];
    context.bindings.newDeskDocument.lastActive = req.body.visitedTime;
  }

  context.res = {
    body: JSON.stringify({
      id: context.bindings.newPageDocument.id,
    }),
  };
  context.done();
};
