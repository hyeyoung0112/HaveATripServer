// require needed modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const userCheck = require('../utils/userCheck.js');
const SQLquery = require('../utils/sqlQuery.js');

// make schedule router and export
const scheduleRouter = express();
module.exports = scheduleRouter;

scheduleRouter.get('/', function (req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		
		var sql = 'SELECT * FROM schedule WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;
		
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503);
					res.send('server failure');
				}
				else if (results[0] != undefined){
					res.status(200);
					res.send(results[0]);
				}
				else {
					console.log(results);
					res.status(404);
					res.send(null);
				}
				});
		});

scheduleRouter.put('/', function(req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		
		var type = req.body.type;
		var date = req.body.date;
		var id = req.body.id;
		var sql = 'SELECT * FROM schedule WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;

		SQLquery(sql).then(function(results) {
			if (results == null){
				res.status(503);
				res.send('failure due to server errors');
			}
			else if (results[0] == undefined) {
				console.log('no results');
				res.status(404);
				res.send('schedule not found');
			}
			else {
				var newData = JSON.parse(results[0].data);
				if (newData[date] != undefined) {
					newData[date].push({"id":id, "type":type});
					var updateSql = 'UPDATE schedule SET data = ' + mysql.escape(JSON.stringify(newData))
						+ ' WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;
					SQLquery(updateSql).then(function(result2) {
							if (result2 == null) res.status(503).send('server failure');
							else res.status(201).send('schedule put success');
							});
				}
				else res.status(400).send('date out of range');
			}
			});
});

scheduleRouter.delete('/:date/:index', function(req, res, next) {
		var email = req.email;
		var tripID = req.tripID;
		var date = req.params.date;
		var index = req.params.index;
		
		var sql = 'SELECT data FROM schedule WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;
		SQLquery(sql).then(function(results){
				if (results == null) res.status(503).send('server failure');
				else if (results[0] == undefined) res.status(404).send('invalid trip data');
				else {
					var newData = JSON.parse(results[0].data);
					console.log(newData);
					if (newData[date] != undefined && newData[date].length > index) {
						newData[date].splice(index, 1);
						console.log(JSON.stringify(newData));
						var updateSql = 'UPDATE schedule SET data = ' + mysql.escape(JSON.stringify(newData)) + ' WHERE email = ' + mysql.escape(email) + ' AND tripID = ' + tripID;
						SQLquery(updateSql).then(function(data) {
								if (data == null) res.status(503).send('server failure');
								else res.status(202).send('update success');
								});
					}
					else res.status(400).send('invalid date or index');
					}	
				});
		});
