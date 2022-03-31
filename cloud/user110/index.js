module.exports = function (context, req) {
  if (context.bindings.userDocument && context.bindings.userDocument.length > 0) {
    context.bindings.newUserDocument = context.bindings.userDocument[0];
  } else {
    context.bindings.newUserDocument = {
      userName: context.bindingData.userName,
      deskType: "writer",
      createdTime: Date.now(),
    };
  }

  context.bindings.newUserDocument.userEmail = req.body.userEmail;
  context.bindings.newUserDocument.appInfo = req.body.appInfo;

  context.bindings.newUserDocument.lastSignin = Date.now();

  context.res = {
    body: JSON.stringify({
      deskType: context.bindings.newUserDocument.deskType,
    }),
  };
  context.done();
};
