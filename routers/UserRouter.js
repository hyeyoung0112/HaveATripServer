// require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const encrypt = require('../utils/encrypt.js');
const sendmail = require('../utils/sendmail.js');
const userCheck = require('../utils/userCheck.js');
const SQLquery = require('../utils/sqlQuery.js');

// make user router and export
const userRouter = express();
module.exports = userRouter;

// find password request sent by post
userRouter.put('/findpwd', (req, res, next) => {
		// get email and name from request body
		var email = req.body.email;
		var name = req.body.name;
		console.log('findpwd request: ' + email + ' ' + name);
		
		userCheck(email, '*').then(function(result) {
			if (result == null) {
				res.status(503).send('server failure');
			}
			else if (result == 404) {
				res.status(404).send('invalid user email');
			}
			// if found, send password search email
			// and update password
			else if (result.name == name) {
				var code = encrypt.makeSalt(8);
				
				var pwd = encrypt.encrypt(code, result.salt);
				var sql2 = 'UPDATE login SET pwd = ' + mysql.escape(pwd) + ' WHERE email = ' + mysql.escape(email);
				SQLquery(sql2).then(function(results) {
						if (results == null) {
							res.status(503).send('server failure');
						}
						else {
							sendmail(email, code, 'findpwd');
							res.status(201).send('new pwd email sent');
						}
						});
			}
		});
});

userRouter.put('/changepwd', function(req, res, next) {
		var email = req.body.email;
		var pwd = req.body.pwd;
		var newpwd = req.body.newpwd;
	
		if (newpwd == undefined || newpwd.length < 6 || newpwd.length > 12) {
			res.status(400).send('password should be 6~12 characters');
		}
		else {
			userCheck(email, 'pwd, salt').then(function(result){
					if (result.pwd == encrypt.encrypt(pwd, result.salt)){
						var salt = encrypt.makeSalt(16);
						var newEncryptedPwd = encrypt.encrypt(newpwd, salt);
						var sql = 'UPDATE login SET pwd = ' + mysql.escape(newEncryptedPwd) + ', salt = ' + mysql.escape(salt)
							+ ' WHERE email = ' + mysql.escape(email);
						SQLquery(sql).then(function(results) {
								if (results == null) {
									console.log(err);
									res.status(503).send('server failure');
								}
								else {
									res.status(201).send('password change successful');
								}
								});
					}
					else {
						res.status(401).send('wrong password');
					}
					});
		}
		});

userRouter.put('/changeName', function(req,res,next) {
		var email = req.body.email;
		var pwd = req.body.pwd;
		var newName = req.body.newName;

		if (newName == undefined || newName.length == 0 || newName.length > 8) {
			res.status(400).send('name out of range or does not exist');
		}
		else {
			userCheck(email, 'pwd, salt').then(function(result) {
					if (result.pwd == encrypt.encrypt(pwd, result.salt)){
						var sql = 'UPDATE login SET name = ' + mysql.escape(newName) + ' WHERE email = ' + mysql.escape(email);
						
						SQLquery(sql).then(function(results) {
								if (results == null) {
									res.status(503).send('server failure');
								}
								else {
									res.status(201).send('change name successful');
								}
								});
						}
					else {
						res.status(401).send('wrong password');
					}
					});
		}
});

userRouter.put('/changeNickname', function(req,res,next) {
		var email = req.body.email;
		var pwd = req.body.pwd;
		var newNickname = req.body.newNickname;

		if (newNickname == undefined || newNickname.length == 0 || newNickname.length > 8) {
			res.status(400).send('nickname out of range or does not exist');
		}
		else {
			userCheck(email, 'pwd, salt').then(function(result) {
					if (result.pwd == encrypt.encrypt(pwd, result.salt)){
					var sql = 'UPDATE login SET nickname = ' + mysql.escape(newNickname) + ' WHERE email = ' + mysql.escape(email);
					SQLquery(sql).then(function(results) {
						if (results == null) {
							res.status(503).send('server failure');
						}
						else {
							res.status(201).send('change nickname successful');
						}
						});
					}
					else {
						res.status(401).send('wrong password');
					}
			});
		}
});

