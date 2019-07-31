// require express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const encrypt = require('../utils/encrypt.js');
const SQLquery = require('../utils/sqlQuery.js');

// make login router and export
const loginRouter = express();
module.exports = loginRouter;

// login request sent through POSt
loginRouter.post('/', (req, res, next) => {
		// get email and password from request body
		var email = req.body.email;
		var pwd = req.body.pwd;
		console.log('login request: ' + email + ' ' + pwd);
		
		// make connections to mysql db
		const connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: 'hyeyoung',
			database: 'HAT_SERVER'
		});
		connection.connect();

		// get user with req.body.email and query
		const sql = 'SELECT * FROM login WHERE email = ' + mysql.escape(email);
//		console.log(sql);
		SQLquery(sql).then(function(results) {
			if (results == null){
				// failure due to server problems
				console.log(error);
				res.status(503);
				res.send('failure due to server errors');
				connection.end();
			}
			else {
				// if not found, send 404 and invalid email response
				if (results[0] == undefined) {
					res.status(404);
					res.send('invalid user email');
					connection.end();
				}
				// if found, check password
				else {
					pwd = encrypt.encrypt(pwd, results[0].salt);
					if (results[0].pwd == pwd) {
						console.log('activation: ' + results[0].activation);
						
						res.status(200);
						res.send(JSON.stringify({
									"email": results[0].email,
									"name": results[0].name,
									"nickname": results[0].nickname
								}));
						connection.end();
					}
					else {
						res.status(400);
						res.send('invalid password');
					}
				}
			}
		});
});
