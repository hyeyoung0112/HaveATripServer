// require needed modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const userCheck = require('../utils/userCheck.js');
const SQLquery = require('../utils/sqlQuery.js');

// make diary router and export
const diaryRouter = express();
module.exports = diaryRouter;

diaryRouter.get('/', function (req, res, next) {
		var email = req.email;
		var tripID = req.tripID;

		var sql = 'SELECT _id, name, date FROM diary WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;
		console.log(sql);
		
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else if (results[0] != undefined){
					res.status(200).send(results);
				}
				else {
					res.status(404).send(null);
				}
				});
		});

diaryRouter.get('/:diaryID', function(req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		var diaryID = req.params.diaryID;

		var sql = 'SELECT * FROM diary WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID + ' AND _id = ' + diaryID;

		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else if (results[0] != undefined){
					res.status(200).send(results[0]);
				}
				else {
					res.status(404).send(null);
				}
				});
		});

diaryRouter.post('/', function (req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		var name = req.body.name;
		var date = req.body.date;
		if (name == undefined || name.length <= 0 || name.length > 10) {
			res.status(400);
			res.send('name too long');
		}
		var data = req.body.data;
		var image = req.body.image;

		userCheck(email, 'email').then(function(result) {
				if (result != null && result != 404) {
					var sql = 'INSERT INTO diary (email, tripID, name, data, date) values (' + mysql.escape(email)
						+ ', ' + tripID + ', ' + mysql.escape(name) + ',' + mysql.escape(data) + ', ' + mysql.escape(date) + ')';
					if (image != undefined) {
						sql ='INSERT INTO diary (email, tripID, name, data, date, image) values (' + mysql.escape(email)
								+ ', ' + tripID + ', ' + mysql.escape(name) + ', ' + mysql.escape(data)
								+ ',' + mysql.escape(date) + ', ' + mysql.escape(image) +')'
					}
					
					SQLquery(sql).then(function(results) {
							if (results == null) res.status(503).send('server failure');
							else res.status(201).send('diary post success');
							});
				}
				else res.status(404).send('invalid user');
				});
		});

diaryRouter.put('/:diaryID', function(req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		var diaryID = req.params.diaryID;
		var name = req.body.name;
		var date = req.body.date;
		var data = req.body.data;
		var image = req.body.image;
		
		var sql = 'UPDATE diary SET data = ' + mysql.escape(data)
		+ ', name = ' + mysql.escape(name)
			+ ', date = ' + mysql.escape(date)
			+ ' WHERE email = ' + mysql.escape(email)
			+ ' AND tripID = ' + tripID + ' AND _id = ' + diaryID;
		if (image != undefined) {
			sql = 'UPDATE diary SET data = ' + mysql.escape(data)
				+ ', name = ' + mysql.escape(name)
				+ ', date = ' + mysql.escape(date)
				+ ', image = ' + mysql.escape(image)
				+ ' WHERE email = ' + mysql.escape(email)
				+ ' AND tripID = ' + tripID + ' AND _id = ' + diaryID;
		}
		
		SQLquery(sql).then(function(results) {
			if (results == null){
				res.status(503).send('server failure');
			}
			else {
				res.status(201).send('trip data update success');
			}
			});
		});

diaryRouter.delete('/:diaryID', function(req, res, next){
		var email = req.email;
		var tripID = req.tripID;
		var diaryID = req.params.diaryID;

		var sql = 'DELETE FROM diary WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID + ' AND _id = ' + diaryID;
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else {
					res.status(202).send('delete diary success');
				}
				});
		});
