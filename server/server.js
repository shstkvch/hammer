Meteor.methods({
  updateScriptElement: function (scriptid, olddata, newdata) {
    return Scripts.update({_id: scriptid, 'elements': olddata}, { $set: { "elements.$": newdata } });
  }
});

Meteor.startup(function () {
  // code to run on server at startup
});
