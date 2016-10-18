
var mongodb = require('mongodb').MongoClient;

function connect(callback) {
	mongodb.connect(process.env.MONGODB_URI, function(err, db) {
		if(err) {
			console.log('mongodb connection error');
			console.log(err);
			callback(err);
		}
		else {
			callback(null, db);
		}

	});
}


function updateWorkingItem(userId, eventId, callback) {
	connect(function(err,db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger-users', function(err, users) {
				users.update({userID:userId}, {$set:{workingItem:eventId}},function(err, result){
					callback(err, result);
				});
			});
		}
	});
}

updateWorkingItem("
function updateEmail(userId, email, callback) {
	connect(function(err, db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger-users', function(err, users) {
				users.update({userID:userId}, {$set:{userEmail:email}}, function(err, result){
					callback(err, result);
				});
			});
		}
	});
}

function updateYear(userId, year, callback) {
	connect(function(err, db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger-users', function(err, users) {
				users.update({userID:userId}, {$set:{userYear:year}}, function(err, result){
					callback(err, result);
				});
			});
		}
	});
}
function updateState(userId, newState, callback) {
	connect(function(err,db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				users.update({userID:userId}, {$set:{state:newState}},function(err, result){
					callback(err, result);
				});
			});
		}
	});
}

function addParticipant(eventId,userId, userFirst, userLast, usergender, userPic, useremail, useryear, callback) {
	connect(function(err, db) {
		if(err)
			callback(err);
		else {
			db.collection('participants', function(err, participants) {
				participants.insertOne({eventID:eventId, userID:userId, userFirstName:userfirst, userLastName:userLast,userGender:usergender, userProfilePic:userPic, userEmail:useremail, userYear: useryear}, callback);
			});
		}
	});
}

function getEventObj(eventId, callback) {
	console.log("EventId " + eventId);
	connect(function(err, db) {
		if(err){
			console.log('fuck');
			callback(err);
		}
		else {
			db.collection('events', function(err, events) {
				events.findOne({_id:eventId}, function(err, docs) {
					db.close();
					if(err) {
						console.log('ffuuuccckkkk');
						callback(err);
					}
					else {
						callback(null, docs);
					}
				});
			});
		}
	});
}
function getUserObj(userId, callback) {
	connect(function(err, db) {
		if(err){
			console.log('fuckkkkkk');
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				users.findOne({userID: userId}, function(err, docs) {
					db.close();
					if(err) {
						console.log('eeeffuuuccckkkk');
						callback(err);
					}
					else {
						if(!docs) {
							insertUser(userId, callback);
						}
						else {
							//docs.toArray(function(err, resultArr) {
								callback(err, docs);
							//});
						}
					}
				});
			});
		}
	});
}

module.exports = {
	getUserObj: getUserObj,
	updateState: updateState,
	updateWorkingItem: updateWorkingItem,
	getEventObj: getEventObj,
	addParticipant:addParticipant,
	updateYear:updateYear,
	updateEmail:updateEmail,
}

