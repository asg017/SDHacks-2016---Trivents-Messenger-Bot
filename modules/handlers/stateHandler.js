var formatter = require('../formatter-messenger.js');
var fbAccess = require('../fbAccess.js');

var lib = require('../lib.js');
var eval = require('../evalMess.js');
var mongo = require('../mongo.js');

function handle1A(userObj, messageEvent, callback) {
	var ret = [];
	
	if(eval.messIsText(messageEvent)) {
		
		var textMess = messageEvent.message.text;

		var split = textMess.split('@');

		if(split.length !== 2 || split[1].substring(0, 8) !== 'ucsd.edu'){
			ret.push(new formatter.ReplyObjText(userObj.userID, 'Please send a valid ucsd.edu Email!'));
			callback(ret);
			return;
		}

		mongo.updateEmail(userObj.userID, textMess, function(err, data) {
			if(err) {
				ret.push(new formatter.ReplyObjText(userObj.userID, 'I\'m sorry, I had some behind-the-scenes issues, do you mind sending me that again?'));
				callback(ret);
				return;
			}
			else {
				mongo.updateState(userObj.userID, '1B', function(err, data) {
					
					if(err) {
						console.log('oh fuck this is bad');
					}

					var titles = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth+ Year', '1st Year Transfer', '2nd Year Transfer'];
					var data = ['IG','IG','IG','IG','IG','IG','IG'];

					ret.push(new formatter.ReplyObjQuick(userObj.userID, 'Awesome! And one final question, what year are you in school? Please choose one of the options below!', titles, data));
					callback(ret);
				});
			}
		});
	}
	else {
		ret.push(new formatter.ReplyObjText(userObj.userID, 'I\'m sorry, please send a text message of your @ucsd.edu email account to register for your event!'));
		callback(ret);
	}
}
function handle1B(userObj, messageEvent, callback) {
	var ret = [];

	if(eval.messIsText(messageEvent)) {
		
	
		mongo.updateYear(userObj.userID, messageEvent.message.text, function(err, data) {
			if(err) {
				console.log('fucking crap');
			}
			else {

			userObj.userYear = messageEvent.message.text;

			mongo.updateState(userObj.userID, null, function(err, data) {});
			
			fbAccess.getUserInfo(userObj.userID, function(err, userInfo) {
				if(err) {
					console.log('fuck');
					return;
				}


			mongo.addParticipant(userObj.workingItem, userObj.userID, userInfo.first_name, userInfo.last_name,userInfo.gender, userInfo.profile_pic, userObj.userEmail, userObj.userYear, function(err, data) {
				if(err) {
					console.log('fuck');
					return;
				}

				mongo.getEventObj(userObj.workingItem, function(err2, eventObj) {


			var buttons = [ new formatter.Button('web_url', 'Sign Waiver',null, 'https://sdhacks16-a.herokuapp.com/enter?id='+userObj.userID, lib.WEB_HEIGHTS.TALL), new formatter.Button('postback', 'View Ticket', JSON.stringify({ticket: {participantID: data.insertedId, eventName:eventObj.name}}))];
				
				ret.push(new formatter.ReplyObjButton(userObj.userID, 'Congraduations, you are successfilly registered for the event "'+eventObj.name+'"! I noticed that you need to sign a waiver form before attending the event, so please click below to sign! And Check our your ticket to the event, too!', buttons));
				callback(ret);
			});
			});
			});
			}
		});
	}
	else {
		ret.push(userObj.userID, 'Please respond wth text or a quick reply!');
		callback(ret); //TODO thi s is weird
	}
}
function handle1C(userObj, messageEvent, callback) {
	
}
function handle2A(userObj, messageEvent, callback) {
	
}
function handle2B(userObj, messageEvent, callback) {
	
}

function handleDefault(userObj, messageEvent, callback) {
	var ret = [];

	ret.push(new formatter.ReplyObjText(userObj.userID, 'I\'m sorry, please send me a picture of an event QR Code to get registered for an event!'));
	callback(ret);
}

function handleState(userObj, messageEvent, callback) {
	var state = userObj.state;

	switch(state) {
		case('1A'):
			handle1A(userObj, messageEvent, callback);
			break;
		case('1B'):
			handle1B(userObj, messageEvent, callback);
			break;
		case('1C'):
			handle1C(userObj, messageEvent, callback);
			break;
		case('2A'):
			handle2A(userObj, messageEvent, callback);
			break;
		case('2B'):
			handle2B(userObj, messageEvent, callback);
			break;
		default:
			handleDefault(userObj, messageEvent, callback);
			break;
	}
}

module.exports = {
	handleState:handleState,
}
