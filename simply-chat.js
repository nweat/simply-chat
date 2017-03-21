Chat = new Mongo.Collection("chat"); //store chat mesages in mongoDB chat collection


if (Meteor.isClient) {
	Meteor.subscribe("chat");
	Meteor.subscribe("userState");
	
//==================================================================================BODY HELPERS START
  Template.body.helpers({
	
  chats: function () {  
   if (Meteor.users.findOne(Meteor.userId())) { //return all messages
  return Chat.find({});
  }
  },
  onlineUsers: function () {
	  if (Meteor.users.findOne(Meteor.userId())) {
  return Meteor.users.find({"status.online": true,  username: { $ne: Meteor.user().username }});
 }
  },
  
  whoisTyping: function () {
	 if (Meteor.users.findOne(Meteor.userId())) {
  return Meteor.users.find({"status.online": true, "typing": "typing", username: { $ne: Meteor.user().username } });   //get users typing status only if their online
  }
  }
  
});
//==================================================================================BODY HELPERS END


//==================================================================================BODY EVENTS START
Template.body.events({
//submit message if input text not empty	
  "submit .new-msg": function (event) {
    var text = event.target.text.value;
    if(text.trim() !== ""){
    Meteor.call("isTyping", '');
    Meteor.call("newMsg", text); 
     }
    
    console.log(event);
    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  },

//monitor as user is typing and keep track if user is typing or not
  "keyup .new-msg input[type=text]": function (event) {  
	 if(event.target.value.trim() !== "") {
      Meteor.call("isTyping", 'typing');
    }
    else{ 
	    Meteor.call("isTyping", '');
	 }
}
});
//==================================================================================BODY EVENTS START


//==================================================================================CHAT EVENTS START
Template.chat.events({
  "click .delete": function () {
   Meteor.call("deleteTask", this._id);
  }
});


Template.chat.rendered = function () {
  $(".chat-box").animate({ scrollTop: $('.chat-box')[0].scrollHeight}, 5); //automatic slide down when a new message is received
}
//==================================================================================CHAT EVENTS END

//==================================================================================CHAT HELPERS START

Template.chat.helpers({
  isOwner: function () {
    return this.owner === Meteor.userId();
  },
  
 //compare logged in user with chat author
  equals: function(param1, param2) {
	return (param1 === param2);
  }
});
//==================================================================================CHAT HELPERS END

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});
}


//==================================================================================DEFINE METHODS HANDLING DB FUNCTIONALITIES
Meteor.methods({
  newMsg: function (text) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");  // Make sure the user is logged in before inserting a task
    }

    Chat.insert({
      text: text,
      createdAt: moment().tz('America/Belize').format('ha z'), //currently only saves time as local time
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  
  
   isTyping: function (text) {
   	 Meteor.users.update(Meteor.userId(), { $set: { typing: text } }); //update users typing status when typing
  },
  
 /* animateChatbox: function(){
	  $(".chat-box").animate({ scrollTop: $('.chat-box')[0].scrollHeight}, 5);
  }, :: caused $ is not defined error when called jquery animation through this function*/
  
  
  deleteTask: function (taskId) {   
  var task = Chat.findOne(taskId); //get the task and remove
  Chat.remove(taskId);
  }
});


//==================================================================================SERVER SIDE, PUBLISH NECESSARY COLLECTIONS
if (Meteor.isServer) {
 Meteor.publish("chat", function () {
  return Chat.find({});
});

 Meteor.publish("userState", function (event) {
   return Meteor.users.find({});
});
}