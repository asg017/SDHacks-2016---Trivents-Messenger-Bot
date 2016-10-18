var formatter = require('./formatter-messenger.js');
var eval = require('./evalMess.js');

var barcode = require('./barcode.js');
var lib = require('./lib.js');
var mongo = require('./mongo.js');

var picHandler = require('./handlers/picHandler.js');
var payloadHandler = require('./handlers/payloadHandler.js');
var stateHandler = require('./handlers/stateHandler.js');

function determineReplies(messageEvent, callback) {
	var ret = [];
	var senderId = messageEvent.sender.id;

	mongo.getUserObj(senderId, function(err, userObj) {
		if(err) {
			console.log('fuck');
			return;
		}
		if(eval.messIsText(messageEvent)) {
			
			stateHandler.handleState(userObj, messageEvent, callback);


		}
		else if(eval.messIsPicture(messageEvent)) {
			var imageURL = messageEvent.message.attachments[0].payload.url;
			picHandler.handlePic(userObj, imageURL, callback);
		}
		else if(eval.messIsQuickReply(messageEvent) && eval.qrIsIgnorable(messageEvent)) {
			stateHandler.handleState(userObj, messageEvent, callback);
		}
		else if(eval.messIsPostback(messageEvent) || eval.messIsQuickReply(messageEvent)) {
			var payload = (eval.messIsPostback(messageEvent))
				? messageEvent.postback.payload
				: messageEvent.message.quick_reply.payload;

			payloadHandler.handlePayload(userObj, JSON.parse(payload), callback);
		}


	});
}

module.exports  = {
	determineReplies: determineReplies,
}
