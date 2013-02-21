Template.script.script = function () {
  if (Session.get("scriptid") == undefined) {
    var script = Scripts.findOne({});
    if (script !== undefined) { // Don't pull a flaky when rendering before data sync
      Session.set("scriptid", script._id);
    } else {
      return {}; 
    }
  }
  return Scripts.findOne({_id: Session.get("scriptid")});
}

var scriptLock = false;
Template.script.rendered = function () {
  if (!scriptLock) { // Run on first render only
    $("#scriptinput").keyup(function (e) {
      if (e.keyCode == 13) { // Enter key
        insertElement($("#scriptinput").val());
        $("#scriptinput").val('');
      }
    });
      
    scriptLock = true;
  }
}

Handlebars.registerHelper('separateLines', function (input, chars) {
  var lines = separateLines(input, chars);
  var out = "";
  
  for (i = 0; i < lines.length; i++) {
    out = out + Handlebars._escape(lines[i]) + "<br />\n";
  }
  
  return out;
});
