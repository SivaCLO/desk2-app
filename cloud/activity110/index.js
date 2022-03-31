module.exports = function (context, req) {
  context.bindings.activityDocument = JSON.stringify({
    userName: context.bindingData.userName,
    activityCode: req.body.activityCode,
    activityData: req.body.activityData,
    activityTime: req.body.activityTime,
  });

  if (
    context.bindingData.userName != "desk" &&
    context.bindings.userDocument[0]
  ) {
    context.bindings.newUserDocument = context.bindings.userDocument[0];
    context.bindings.newUserDocument.lastActive = req.body.activityTime;
  }

  context.res = {
    body: "Success",
  };
  context.done();
};
