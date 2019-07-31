const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const userCheck = require('../utils/userCheck.js');
const path = require('path');
const SQLquery = require('../utils/sqlQuery.js');

const imageRouter = express();
module.exports = imageRouter;

imageRouter.post('/upload', function (req, res, next) {
		var filename = 'img' + Date.now() + '.jpg';
		var filepath = './image/' + filename;
		var email = req.body.user;
		var image = req.body.image;
		var buff = new Buffer(image, 'base64');

		console.log(filename, email);
		
		userCheck(email, 'email').then(function(data) {
			if (data != null && data != 404){
				var fs = require('fs');
				fs.writeFileSync(filepath, buff);
				var sql = 'INSERT INTO image (user, filename) VALUES (' 
					+ mysql.escape(email) + ', ' + mysql.escape(filename) + ')';
				SQLquery(sql).then(function(results) {
						if (results == null) res.status(503).send('server failure');
						else res.status(201).send(filename);
						});
			}
			else {
				res.status(400).send('invalid user');
			}
			});
		});

imageRouter.get('/:email/:filename', function (req, res, next) {
		var user = req.params.email;
		var filename = req.params.filename;
		var sql = 'SELECT * FROM image WHERE filename = ' + mysql.escape(filename);
		SQLquery(sql).then(function(data) {
				if (data ==	null) {
					res.status(503).send('server failure');
				}
				else if (data[0] == undefined) {
					res.status(400).send('wrong filename');
				}
				else if (data[0].user != user) {
					res.status(400).send('wrong email');
				}
				else {
					var fs = require('fs');
					var filePath = path.resolve('./image/' + filename);
					if (fs.existsSync(filePath)) {
						var fileStream = fs.createReadStream(filePath);
						res.writeHead(200, {"Content-Type": "image/jpeg"});
						fileStream.pipe(res);
					}
					else {
						res.status(404).send('invalid file');
					}
				}
				});
		});
