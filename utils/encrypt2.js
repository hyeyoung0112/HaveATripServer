const crypto = require('crypto');

const key = "YOUR_KEY";

function encrypt(message, salt) {
	var algorithm = 'aes-256-ctr';
	var cipher = crypto.createCipheriv(algorithm, key, salt);
	var crypted = cipher.update(message, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

function makeSalt(length) {
	return crypto.randomBytes(Math.ceil(length/2))
		.toString('hex')
		.slice(0,length);
}


function makeVerifCode(email, name, timestamp) {
	// use crypto to generate verification code
	// input is name + timestamp, with email as key
	var hmac = crypto.createHmac('sha256', email);
	var msg = new Buffer(name + timestamp).toString('base64');
	hmac.write(msg);
	hmac.end();
	var code = new Buffer(hmac.read()).toString('base64');
	code = code.substring(0, 8);
	return code;
}


module.exports = { "encrypt": encrypt, "makeSalt": makeSalt, "makeVerifCode": makeVerifCode };
