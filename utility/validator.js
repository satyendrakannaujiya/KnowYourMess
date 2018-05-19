
var validPassword = (password, callback) => {
	if(password.length < 8)
		callback('Error: Length must be greater than 8');
	else
		callback(undefined, true);
}
var validUserID = (userId, callback) => {
	if(userId.length < 8)
		callback('Error: Length must be greater than 8');
	else
		callback(undefined, true);
}

module.exports={
	validPassword,
	validUserID
};