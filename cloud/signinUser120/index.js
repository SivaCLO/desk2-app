const uuid = require("uuid");

module.exports = function (context, req) {
  if (context.bindings.deskDocument && context.bindings.deskDocument.length > 0) {
    context.bindings.newDeskDocument = context.bindings.deskDocument[0];
  } else {
    context.bindings.newDeskDocument = {
      id: uuid.v4(),
      type: "writer",
      settings: {},
      flags: {},
      createdTime: Date.now(),
    };
  }

  req.body.mediumUser && (context.bindings.newDeskDocument.mediumUser = req.body.mediumUser);

  context.bindings.newDeskDocument.lastSignin = Date.now();
  req.body.version && (context.bindings.newDeskDocument.lastSigninVersion = req.body.version);

  context.res = {
    body: JSON.stringify({
      id: context.bindings.newDeskDocument.id,
      type: context.bindings.newDeskDocument.type,
      settings: context.bindings.newDeskDocument.settings,
      flags: context.bindings.newDeskDocument.flags,
    }),
  };
  context.done();
};
