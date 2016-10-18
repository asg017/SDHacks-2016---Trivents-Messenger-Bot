var formatter = require('../formatter-messenger.js');
var mongo = require('../mongo.js');


function handleMenu(userObj, menuObj, callback) {
		if(menuObj.viewMy) {
			mongo.getUserEvents(userObj.userID, function(err, events) {
				if(err) {
					console.log('asdfas');
					return;
				}
				else {
					//TODO Generic items carousel
				}
			});
		}

}


module.exports = {
	handleMenu:handleMenu,
}
