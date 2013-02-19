Scripts = new Meteor.Collection("script");

if (Meteor.isServer) {
  Meteor.methods({
    updateScriptElement: function (scriptid, olddata, newdata) {
      return Scripts.update({_id: scriptid, 'elements': olddata}, { $set: { "elements.$": newdata } });
    }
  });
}

if (Meteor.isClient) {
  //Template.hello.greeting = function () {
  //  return "Welcome to hammerconcept.";
  //};
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
    
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

function insertElement(input) {
  var data    = {};
      input   = input.trim();  
  var input_l = input.toLowerCase();
  
  if (input_l.startsWith("int.") || input_l.startsWith("ext.")) {
    // Slugline
    data.type    = "slugline";
    data.content = input;
    
  } else if (input.indexOf(":") !== -1 ) {
    // Dialogue
    var index = input.indexOf(":");
    data.type      = "dialogue";
    data.character = input.substr(0, index);
    data.content   = input.substr(index + 1).trim();
    
    // Merge with previous dialogue if same character
    var previous = Scripts.findOne({_id: Session.get("scriptid")}).elements.pop()
    if (previous !== undefined && previous.type == "dialogue" && previous.character.toLowerCase() == data.character.toLowerCase()) {
      merged = {
        type: "dialogue",
        character: previous.character,
        content: previous.content + "\n" +  data.content
      }
      // Use RPC because minimongo doesn't support the mongo positional operator
      return Meteor.call("updateScriptElement", Session.get("scriptid"), previous, merged); 
    }
    
  } else {
    // Action
    data.type = "action";
    data.content = input;
  }
  
  Scripts.update({_id: Session.get("scriptid")}, {$push: {elements: data}});
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

function separateLines (input, chars) {
  var lines = [];
  input = input.trim();
  while (input.length > chars) {
    var text = input.substr(0, chars);
    var i = text.lastIndexOf(" ");
    var j = text.lastIndexOf("\n");
        
    if (i == -1 && j == -1) { 
      // Force break mid word :(
      i = chars - 1;
    }
    if (j !== -1 && j < i) {
      // if newlines in string and before last space
      k = j;
    } else {
      k = i;
    }
    
    lines.push(text.substr(0, k));
    input = input.substr(k + 1);
  }
   
  if (input.length > 0) {
    lines.push(input);
  }
 
  return lines;
}
