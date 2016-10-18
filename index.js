"use strict";
//Uses exporess library
var express = require('express');

//Uses bodyParser Libary
var bodyParser = require('body-parser');

//Uses a request library
var request = require('request');

//Sends messages if there are dire errors early on
var formatter = require('./modules/formatter-messenger.js');

var lib = require('./modules/lib.js');

var reply = require('./modules/reply.js');

var fbAccess = require('./modules/fbAccess.js');
var mongo = require('./modules/mongo.js');

//Create Express APP
var app = express();

//Capture FB page access token
var PAGE_TOKEN = process.env.PAGE_TOKEN;

//Token for specific page, looks like the_password_is_my_voice
var VERIFY_TOKEN = process.env.VERIFY_TOKEN;

//Used to parse through our server's webpages ???
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));


//Send back some generic front page html file
app.get("/", function (req, res) {
			//Send back generic message
			
			res.send('hiya mate');

});



//

var userId1 = undefined;

app.get("/enter", function(req, res) {
	//
	userId1 = req.query.id;
	fbAccess.getUserInfo(req.query.id, function(err, userInfo) {

		if(userInfo) 
			console.log(JSON.stringify(userInfo));

		var getName = function() { return userInfo.first_name + ' ' + userInfo.last_name; } //todo: get name from db
		require(require('path').join(__dirname, "docusign/docusign.js"))(req.query.id, getName(req.query.id), (url) => {
			res.writeHead(303, {Location: url});
			res.end();
			return;
		});
	});
});

//
app.get("/exit", function(req, res) {
	if (req.query.event === "signing_complete") {
		console.log('signing complete, userid1 = ' + userId1);
		mongo.updateSign(userId1, function(err, data) {
			res.send('<html><head><script>function close() {window.close();}</script></head><h2>You have successfully signed the waiver for your event!</h2> <button onclick="close()">Go back to Messenger!</button></html>');

		});

		//update database and congratulate user
	} else {
		res.end('failure');
		//prompt user again
	}
});



//Used to first set up Webhook with Facebook
app.get("/webhook", function (req, res) {
			
	/*If token given by requesting server matches the one for 
	 Facebook, challenge??? it. Else, send invalid token message*/
	if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
		res.send(req.query["hub.challenge"]);
	} 
	else {
		res.send("Invalid verify token");
	}
});

//Handle Webook Interactions with Facebook
app.post('/webhook/', function (req, res) {
	
		//Used if a reply is needed
		var ret = [];

		//Get instance of the message 
		var messaging_messageEvents = req.body.entry[0].messaging;

		//Loop through each of the messaging messageEvents
		for (var i = 0; i < messaging_messageEvents.length; i++) {

			//Get instace of the current message
			var messageEvent = req.body.entry[0].messaging[i];

			//Get id of the sender
			var senderID = messageEvent.sender.id.toString();

			console.log('MESSAGE REC: |' + JSON.stringify(messageEvent) + '|');
			
			//Mark the user's message as read, simulate "typing"
			sendMessage(new formatter.ReplyObjSenderAction(senderID, 
				lib.SENDER_ACTIONS.SEEN));
			sendMessage(new formatter.ReplyObjSenderAction(senderID, 
				lib.SENDER_ACTIONS.TYPE_ON));
			
			sendMessage({recipient: senderID, message:{text:"Hiya", metadata:"TESTESTEST"}});
			//Delegate to replyHandler. ReplyObjs is an array of ReplyObjs. 
			reply.determineReplies(messageEvent, function(ReplyObjs) {
				sendMessages(ReplyObjs, function() {
					//Turn off typing when done.
					sendMessage(new formatter.ReplyObjSenderAction(
						senderID, lib.SENDER_ACTIONS.TYPE_OFF));
				});
			});	

		}//end for loop
		
		//Send status 200 within 20 seconds, or bad stuff happens
		res.sendStatus(200);
	});

/*
 * Sends an array of replies to the specified users, with delay.
 * @param replyObjs - Array of Reply Objs (constructors in modules/formatter-messenger.js
 * @param callback - function to invoke when complete.
 */
function sendMessages(replyObjs, callback){
	
	// Have a 300 millisecond delay between messages. Because if sent all at 
	// once, sometimes messages don't appear in right order for user.
	var DELAY = 300;
	
	// Because I didn't know how to do this correctly when I first learned nodejs,
	// I just followed StackOverflow. TODO make this nicer and cleaner
    replyObjs.reverse();

    //Help from http://stackoverflow.com/a/30575612
    function waitAndDo(times) {
        if (times == 0 ) {
			callback();
            return;
        }
		else if (times == 1) {
			DELAY = 0;
		}

        setTimeout(function(){
			sendMessage(replyObjs[times-1]);
            waitAndDo(times-1);
        }, DELAY);
    }

    waitAndDo(replyObjs.length);
}


/*
 * Sends a singular ReplyObj Message
 * @param message - object that has all necessary parameters for Facebook standards.
 */
function sendMessage(message) {
	console.log("sending message " + JSON.stringify(message));

	var pageToken = PAGE_TOKEN;
	
	//Happens only when testing a user
	if(process.env.TEST_USERID_1 === message.recipient.id) {	
		
		pageToken = process.env.TEST_PAGE_TOKEN_1;
	}

	//POST the message for Facebook to Send
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:pageToken},
        method: 'POST',
        json: message
    }, function(error, response, body) {
		//TODO better error handling, maybe print more pertinent info
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });
};

