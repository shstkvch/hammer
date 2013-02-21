// Code common to client and server lives here

Scripts = new Meteor.Collection("script");

function insertElement(input) {
  var data    = {};
      input   = input.trim();  
  var input_l = input.toLowerCase();
  
  if (input == "") {
    return false;
  }
  
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
  
  return Scripts.update({_id: Session.get("scriptid")}, {$push: {elements: data}});
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
