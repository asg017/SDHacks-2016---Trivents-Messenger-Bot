var formatter = require('../formatter-messenger.js');
var barcode = require('../barcode.js');
var mongo = require('../mongo.js');

function handlePic(userObj, picURL, callback) {
	var ret = [];

	barcode.decode(picURL, function(err, resultArray) {
		if(err) {
			if(err.num === 1) {
				ret.push(new formatter.ReplyObjText(userObj.userID, 'I was not able to find a barcode in that image!'));
			}
			else {
				ret.push(new formatter.ReplyObjText(userObj.userID, 'Lol I fucked up!!11!!!11!'));
			}
			callback(ret);
		}
		else {
			handleFound(userObj, resultArray, callback);
		}
	});
	
}

function handleFound(userObj, resultArray, callback) {
	var ret = [];
	//stolen from http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
	function IsJsonString(str) {
    	try {
        	JSON.parse(str);
	    } 
		catch (e) {
        	return false;
    	}

    	return true;
	}

	var barcodeValue = resultArray[0].raw_text;
	console.log('barcodeValue: ' + barcodeValue + '| type of ' + (typeof barcodeValue));

	if(IsJsonString(barcodeValue)) {
		handleJSONBarcode(userObj, JSON.parse(barcodeValue), callback);
	}
	else {
		ret.push(new formatter.ReplyObjText(userObj.userID, 'I\'m sorry, I was not able to get any event information from that barcode! Please try again with a verified event barcode!'));
		callback(ret);
	}

}

function handleJSONBarcode(userObj, barcodeJsonObj, callback) {
	var eventObj = {};
	var eventId;
	var ret = [];

	if(!(barcodeJsonObj.id)) {
		console.log('handle this');
		return;
	}
	eventId = barcodeJsonObj.id;
	console.log('eventId: ' + eventId);

	mongo.getEventObj(eventId, function(err1, eventObj) {
		console.log("++++++++++"+JSON.stringify(eventObj));
		mongo.updateWorkingItem(userObj.userID, eventId, function(err2, data) {
			
			if(!eventObj) {
				ret.push(new formatter.ReplyObjText(userObj.userID, 'I\'m sorry, that barcode isn\'t one of my events!'));
				callback(ret);
				return;
			}

			if(err1 || err2) {
				console.log('double fuck');
				return;
			}
			
			ret.push(new formatter.ReplyObjQuick(userObj.userID, 'This QR Code is the for the event "' + 
				eventObj.name + '"! Would you like to register for this event?',
				['Yes!', 'Not Today'], 
				[JSON.stringify({register:{yes:1}}), JSON.stringify({register:{no:1}}) ]   ));
			callback(ret);
		});
	});

	
}
module.exports = {
	handlePic: handlePic,
}
