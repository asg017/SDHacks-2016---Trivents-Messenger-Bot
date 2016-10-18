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
function insertUser(userId, callback) {
	connect(function(err, db) {
		if(err) {
			console.log('lol fuck me');
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				users.insert({userID:userId}, function(err, ids) {
					if(err) {
						console.log('expletive');
						callback(err);
					}
					else {
						users.findOne({userID:userId},function(err, docs) {
							if(err) 
								callback(err);
							else {
								callback(err, docs);
							}
						});
					}
				});
			});
		}
	});
}

function updateWorkingItem(userId, eventId, callback) {
	connect(function(err,db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				users.update({userID:userId}, {$set:{workingItem:eventId}},function(err, result){
					callback(err, result);
				});
			});
		}
	});
}

function updateSign(userId, callback) {
	console.log('upd sign ' + userId);
	connect(function(err, db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('participants', function(err, parts) {
				parts.update({userID:userId}, {$set: {signedWaiver:'true'}}, function(err, data) {
					console.log('err:');
					console.log(err);
					callback(err, data);
				});
			});
		}
	});
					
}
function updateEmail(userId, email, callback) {
	connect(function(err, db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				users.update({userID:userId}, {$set:{userEmail:email}}, function(err, result){
					callback(err, result);
				});
			});
		}
	});
}

function getParticipant(participantID, callback) {
	console.log('Given: participantID: ' + participantID);
	connect(function(err,db) {
		if(err) {
			callback(err);
			console.log(err);
		}
		else {
			db.collection('participants', function(err, participants) {
				if(err)
					callback(err);

				participants.findOne({"_id.$oid":participantID}, function(err, result) {
					db.close();
					callback(err, result);
				});
			});
		}
	});
}

function updateYear(userId, userYear, callback) {
	connect(function(err,db) {
		if(err) {
			callback(err);
		}
		else {
			db.collection('messenger_users', function(err, users) {
				if(err) {
					console.log('damnit');
					console.log('err: ' + JSON.stringify(err));
					db.close();
					return;
				}
				users.update({userID:userId}, {$set:{year:userYear}}, function(err, result){
					callback(err, result);
					db.close();
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
					db.close();
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
				if(err) {
					console.log(err);
					console.log('partp ' + JSON.stringify(err));
				}
				participants.insertOne({eventID:eventId, userID:userId, userFirstName:userFirst, userLastName:userLast,userGender:usergender, userProfilePic:userPic, userEmail:useremail, userYear: useryear}, callback);
			});
		}
	});
}

function getEventObj(eventId, callback) {
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

/*function getUserEvents(userID, callback) [
	connect(function(err, db) {
		if(err)
			callback(err);
		else {
			db.collection*/
module.exports = {
	getUserObj: getUserObj,
	updateState: updateState,
	updateWorkingItem: updateWorkingItem,
	getEventObj: getEventObj,
	addParticipant:addParticipant,
	updateYear:updateYear,
	updateEmail:updateEmail,
	getParticipant:getParticipant,
	updateSign:updateSign,
}

