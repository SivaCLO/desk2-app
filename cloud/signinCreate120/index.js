const uuid = require("uuid");

module.exports = function (context, req) {
  const signinId = uuid.v4();
  context.bindings.newSigninDocument = { id: signinId };

  req.body && req.body.version && (context.bindings.newSigninDocument.version = req.body.version);

  context.res = { body: JSON.stringify({ signinId }) };
  context.done();
};
