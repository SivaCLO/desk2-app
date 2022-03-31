module.exports = function (context, req) {
  if (context.bindings.deskDocument && context.bindings.deskDocument.length > 0) {
    context.bindings.newDeskDocument = context.bindings.deskDocument[0];

    req.body.settings && (context.bindings.newDeskDocument.settings = req.body.settings);
    req.body.flags && (context.bindings.newDeskDocument.flags = req.body.flags);

    context.res = { status: 200 };
    context.done();
  } else {
    context.res = { status: 400 };
    context.done();
  }
};
