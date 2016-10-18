/* File Name: lib.js
*  Author: Alex Garcia
*  Description: Holds some commonly used functions/constructors/data that are 
				used throughout the app.
*  Edit Date: 9/18/17
*/

//Uses formatter-messenger to provide common message templates for TritonFind
var formatter = require('./formatter-messenger.js');


//Different tipes of notifications a message can have
var _NOTIF_TYPES = {
	REG : 'REGULAR',
	SILENT : 'SILENT_PUSH',
	NONE : 'NO_PUSH'
}

var _WEB_HEIGHTS = {
	COMPACT: 'compact',
	TALL: 'tall',
	FULL: 'full'
}

//All the different user state a user can have in the "users" sql table TODO
var _USER_STATES = {
	
}


//Commmon User Object constructor, to provide some functions
function UserObj(sqlResult) {
	this.userKey = sqlResult.userKey;
	this.userID = sqlResult.userID;
	this.state = sqlResult.state;
	this.workingItem = sqlResult.workingItem;
	this.isSubscribed = function() {return (sqlResult.subscribed === 1); };
	this.lastMess = sqlResult.lastMess;
	this.convo = sqlResult.convo;
	this.isInConvo = function() { return ( this.convo ) };
	this.numItems = sqlResult.numItems;
}

//All types of "Sender actions" that Messenger accepts
var _SENDER_ACTIONS = {
	
	SEEN : 'mark_seen',
	TYPE_ON : 'typing_on',
	TYPE_OFF : 'typing_off',
};

//Array of user ID's of all admins, used for notifying admins of reports
var _ADMINS = 
	[
		process.env.ADMIN_ID,
	];

//Somem emojis that TritonFind uses. TODO add more emojis
var _EMOJIS = {
	BALLOON	: "🎈" ,
	HEART	: "❤️",
}

//Array of all characters users in report ID's
var idChars = 
	[
		"0","1","2","3","4","5","6","7","8","9",
		"A","B","C","D","E","F","G","H","I","J",
		"K","L","M","N","O","P","Q","R","S","T",
		"U","V","W","X","Y","Z","a","b","c","d",
		"e","f","g","h","i","j","k","l","m","n",
		"o","p","q","r","s","t","u","v","w","x",
		"y","z","@","#","$","%","^","&","*","(",
		")","+","~",
	];

//Array of gifs that can be sent when someone says "goodbye"
var goodbyeGifs = [
	'https://asg017.github.io/Projects/TritonFind/pics/bye1.gif',
	'https://asg017.github.io/Projects/TritonFind/pics/bye2.gif',
	'https://asg017.github.io/Projects/TritonFind/pics/bye3.gif',
	'https://asg017.github.io/Projects/TritonFind/pics/bye4.gif',
	'https://asg017.github.io/Projects/TritonFind/pics/bye5.gif'
	]

//fetches random Goodbye Gif
function getRandomByeGif() {
	return goodbyeGifs[getRandomBetween(goodbyeGifs.length-1, 0)];
}

//Source: https://gist.github.com/kerimdzhanov/7529623
//Random number betwnee max/min
function getRandomBetween(max, min){
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//Make random ID from the IDChars array
function getRandomID(size) {
	
	var idStr = '';

	for(var i = 0; i < size; i++) {
		idStr += idChars[ getRandomBetween(idChars.length, 1)-1 ];
	}

	return idStr;

}


module.exports = {
	NOTIF_TYPES	 		: _NOTIF_TYPES,
	SENDER_ACTIONS 		: _SENDER_ACTIONS,
	USER_STATES			: _USER_STATES,
	UserObj 			: UserObj,
	getRandomID			: getRandomID,
	EMOJIS				: _EMOJIS,
	ADMINS				: _ADMINS,
	getRandomBetween	: getRandomBetween,
	getRandomByeGif		: getRandomByeGif,
	WEB_HEIGHTS			: _WEB_HEIGHTS,
}
