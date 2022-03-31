module.exports = function (context, req) {
  context.bindings.activityDocument = JSON.stringify({
    deskId: context.bindingData.deskId,
    activityCode: req.body.activityCode,
    activityData: req.body.activityData,
    activityTime: req.body.activityTime,
  });

  if (context.bindings.deskDocument[0]) {
    context.bindings.newDeskDocument = context.bindings.deskDocument[0];
    context.bindings.newDeskDocument.lastActive = req.body.activityTime;
  }

  context.res = {
    body: "Success",
  };
  context.done();
};
