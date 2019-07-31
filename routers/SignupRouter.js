// require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const sendmail = require('../utils/sendmail.js');
const crypt = require('../utils/encrypt.js');
const SQLquery = require('../utils/sqlQuery.js');

// make signup router and export
const signupRouter = express();
module.exports = signupRouter;

// function to make sure email is written like anystring@anystring.anystring
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

signupRouter.post('/verif', (req, res, next) => {
		// get user email and check if it's in email format
		var email = req.body.email;
		var verifCode = req.body.verifCode;
		
		console.log('verif request: ' + email + ', ' + verifCode);
		if (email.length == 0 || email.length > 30 || !validateEmail(email)) {
			res.status(400);
			res.send('invalid email');
			return;
		}
		
		if (verifCode == undefined) {
			console.log('no verif code');
			// check if user with same email exists
			var sql = 'SELECT name, email FROM login WHERE email = ' + mysql.escape(email);
			SQLquery(sql).then(function (results) {
					if (results === null) {
						res.status(503).send('server failure');
					}
					else if (results[0] == undefined) {
						// make verification code
						var timestamp = new Date().getTime() % 1000000;
						var verifCode = crypt.makeVerifCode(email, crypt.makeSalt(16), timestamp);

						var sql2 = 'INSERT INTO login (email, activation) VALUES (' + mysql.escape(email) + ', ' + mysql.escape(verifCode) + ')';
						
						// save email and verification code
						SQLquery(sql2).then(function (results) {
							if (results == null) {
								res.status(503).send('server failure');
							}
							else {
								sendmail(email, verifCode, 'verif');
								res.status(201).send('verification email sent');
							}
						});
					}
					// existing user
					else {
						// already completed signup
						if (results[0].name != undefined) {
							res.status(400).send('existing user');
						}
						// stopped during signup
						else {
							// generate new verifCode
							var timestamp = new Date().getTime() % 1000000;
							var verifCode = crypt.makeVerifCode(email, crypt.makeSalt(16), timestamp);

							// update verification code and send email
							var sql2 = 'UPDATE login SET activation = ' + mysql.escape(verifCode) + ' WHERE email = ' + mysql.escape(email);
							SQLquery(sql2).then(function(results) {
									if (results == null) {
										res.status(503).send('failure due to server errors');
									}
									else {
										sendmail(email, verifCode, 'verif');
										res.status(201).send('verification email sent');
									}
							});
						}
					}
			});
		}

		// email verification
		else {
			var sql = 'SELECT * FROM login WHERE email = ' + mysql.escape(email);
			SQLquery(sql).then(function(results) {
					if (results == null) {
						res.status(503).send('failure due to server errors');
					}
					else {
						if (results[0].activation == verifCode) {
							var sql2 = 'UPDATE login SET activation = null WHERE email=' + mysql.escape(email);
							SQLquery(sql2).then(function (results) {
									if (results == null) {
										res.status(503).send('failure due to server errors');
									}
									else {
										res.status(201).send('email verification completed');
									}
							});
						}
						else {
							res.status(400).send('wrong verification code');
						}
					}
			});
		}
});

// signup request sent through POST
signupRouter.post('/', (req, res, next) => {
		// get email and password from request body
		var email = req.body.email;
		var name = req.body.name;
		var nickname = req.body.nickname;
		var pwd = req.body.pwd;

		// check if all input data are valid
		if (email.length == 0 || email.length > 30 || !validateEmail(email))
		{
			res.status(400).send('invalid email');
			return;
		}
		if (name.length == 0 || name.length > 10) {
			res.status(400).send('name should be 1~10 characters');
			return;
		}
		if (nickname.length == 0 || nickname.length > 10) {
			res.status(400).send('nickname should be 1~10 characters');
			return;
		}
		if (pwd.length < 6 || pwd.length > 12) {
			res.status(400).send('pwd should be 6~12 characters');
			return;
		}

		// check if user with same email exists
		var sql = 'SELECT * FROM login WHERE email = ' + mysql.escape(email);
		SQLquery(sql).then(function(results) {
				if (results == null){
					// failure due to server problems
					res.status(503).send('server failure');
				}
				else {
					// if not found, we can register new user!
					if (results[0].activation == null && results[0].name == undefined) {
						// encrypt password
						var salt = crypt.makeSalt(16);
						var pwd_crypt = crypt.encrypt(pwd, salt);

						// store email, name, nickname, pwd to mysql db
						var insert_sql = 'UPDATE login SET name = ' + mysql.escape(name)
							+ ', nickname = ' + mysql.escape(nickname)
							+ ', pwd = ' + mysql.escape(pwd_crypt)
							+ ', salt = ' + mysql.escape(salt)
							+ ' WHERE email = ' + mysql.escape(email);				
						SQLquery(insert_sql).then(function(results) {
								if (results == null) {
									res.status(503).send('failure due to server errors');
								}
								else {
									// send successful response
									res.status(201).send('signup successful');
								}
						});
					}
					// activation is not completed
					else if (results[0].activation != null) {
						res.status(401).send('email verification needed');
					}
					// user already exists
					else {
						res.status(400).send('existing user');
					}
				}
		});
});
