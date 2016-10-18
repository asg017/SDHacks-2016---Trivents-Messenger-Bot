var request = require('request');

function getUserInfo(userID, callback) {
	
	var requestStr = "https://graph.facebook.com/v2.6/" + userID + 
				"?fields=first_name,last_name,gender,profile_pic&access_token=" + 
				process.env.PAGE_TOKEN;
	//Will hold info about the user (used to capture a facebook error)
	var userInfo;
	
	//Request it
	request(requestStr, function(error, response, body) {

		if(error) {
			console.log('REQUEST ERROR: ' + error.message);
			callback(error);
		}

		userInfo = JSON.parse(body);

		//Error is accessing userInfo, but not Request error
		if(userInfo.error) {
			console.log('FB ACCESS ERROR: ' + JSON.stringify(userInfo.error));
			callback(true);
		}
		else {
			callback(null, userInfo);
		}
	});
	
}



module.exports = {
	getUserInfo:getUserInfo,
}
