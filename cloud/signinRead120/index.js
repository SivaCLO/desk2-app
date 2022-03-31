module.exports = (context, req) => {
  context.log(context.bindings.signinDocument);
  if (context.bindings.signinDocument && context.bindings.signinDocument.length > 0) {
    context.res = {
      body: JSON.stringify({
        mediumTokens: context.bindings.signinDocument[0].mediumTokens,
        mediumUser: context.bindings.signinDocument[0].mediumUser,
      }),
    };
    context.done();
  } else {
    context.res = { status: 400 };
    context.done();
  }
};
