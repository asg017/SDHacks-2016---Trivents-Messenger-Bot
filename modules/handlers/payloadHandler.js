var formatter = require('../formatter-messenger.js');
var barcode = require('../barcode.js');
var mongo = require('../mongo.js');

function handleRegister(userObj, registerObj, callback) {
	var ret = [];
	console.log('registerobj: ' + JSON.stringify(registerObj));
	if(registerObj.yes) {
		mongo.updateState(userObj.userID, '1A', function(err, data) {
			if(err) {
				ret.push(new formatter.ReplyObjQuick(userObj.userID, 'Woah, I\'m sorry! I had an issue processing that, do you mind choosing your option again?'));
				callback(ret);
				return;
			}
			ret.push(new formatter.ReplyObjText(userObj.userID, 'Awesome! Before you can regsiter, what is ' + 
			 'your @ucsd.edu email?'));
			callback(ret);
			});
	}
	else {
		ret.push(new formatter.ReplyObjText(userObj.userID, 'No problem! Send me another pic of a QR Code for an event you\'d like to attend!'));
	callback(ret);
	}
}

function handleTicket(userObj, ticketObj, callback) {
	var ret = [];
	mongo.getParticipant(ticketObj.participantID, function(err, partObj) {
		console.log(err);
		console.log(partObj);
		if(!partObj) partObj = {eventID:'asdfasdfkjdshfalsjkfhasdklfjhadsdsilfhuadsilfahsflioadshuiodhfilaewhu'};

		console.log(partObj.eventID);

			ret.push(new formatter.ReplyObjText(userObj.userID, 'This is your ticket for the ' + ticketObj.eventName + '!'));
			ret.push(new formatter.ReplyObjPicture(userObj.userID, barcode.generate(ticketObj.participantID)));
			callback(ret);
	});
}

function handlePayload(userObj, payload, callback) {
	if(payload.menu) {
		menuHandler.handleMenu(userObj, payload.menu, callback);
	}
	else if(payload.register) {
		handleRegister(userObj, payload.register, callback);
	}
	else if(payload.ticket) {
		handleTicket(userObj, payload.ticket, callback);
	}
	//else if(payload.confirm??
}

module.exports = {
	handlePayload : handlePayload,
}
