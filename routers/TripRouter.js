// require needed modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const userCheck = require('../utils/userCheck.js');
const emptySchedule = require('../utils/dates.js');
const SQLquery = require('../utils/sqlQuery.js');

// make trips router and export
const tripsRouter = express();
module.exports = tripsRouter;

const scheduleRouter = require('./ScheduleRouter.js');
const diaryRouter = require('./DiaryRouter.js');

tripsRouter.get('/:email', function (req, res, next) {
		var email = req.params.email;
		var sql = 'SELECT * FROM trip WHERE email = ' + mysql.escape(email);
		
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else {
					res.status(200).send(results);
				}
		});
});

tripsRouter.get('/:email/:tripID', function (req, res, next) {
		var email = req.params.email;
		var tripID = req.params.tripID;

		var sql = 'SELECT * FROM trip WHERE email = ' + mysql.escape(email)
			+ ' AND _id = ' + tripID;

		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else if (results[0] == undefined) {
					res.status(404).send('no trip data exist');
				}
				else {
					res.status(200).send(results[0]);
				}
		});
});

tripsRouter.post('/:email', function(req, res, next) {
		var email = req.params.email;
		var name = req.body.name;
		var start = req.body.start;
		var end = req.body.end;
		var area1 = req.body.area1;
		var area2 = req.body.area2;
		var area3 = req.body.area3;
		
		if (name == undefined || name.length == 0 || name.length > 8) {
			res.status(400).send('invalid trip name');
		}
		if (start == undefined || end == undefined) {
			res.status(400).send('invalid start|end date');
		}
		if (area1 == undefined) {
			res.status(400).send('invalid area');
		}
		
		// check if user email is not valid
		userCheck(email, 'email').then(function(data) {
			if (data == null || data == 404) {
				res.status(400).send('invalid user');
			}
			else {
				var postSql = 'INSERT INTO trip (email, name, start, end, area1, area2, area3) values ('
						+ mysql.escape(email) + ', '
						+ mysql.escape(name) + ', '
						+ mysql.escape(start) + ', '
						+ mysql.escape(end) + ', '
						+ area1 + ', ' + area2 + ', ' + area3 + ')';
				SQLquery(postSql).then(function(result) {
					if (result == null) {
						res.status(503).send('server failure');
					}
					else {
						var tripID = result.insertId;
						console.log('insert id', tripID);
						var schedule = JSON.stringify(emptySchedule(new Date(start), new Date(end)));
						console.log('empty schedule: ' + schedule);
						var scheduleSql = 'INSERT INTO schedule (email, tripID, data) values ('
								+ mysql.escape(email) +  ', ' + tripID + ', ' + mysql.escape(schedule) + ')';
						SQLquery(scheduleSql).then(function(result2) {
								if (result2 == null) {
									res.status(503).send('server failure');
								}
								else {
									res.status(201).send('create schedule successful');
								}
							});
					}
				});
			}
		});
});

tripsRouter.put('/:email/:tripID', function(req, res, next) {
		var email = req.params.email;
		var tripID = req.params.tripID;
		var name = req.body.name;
		var start = req.body.start;
		var end = req.body.end;
		var area1 = req.body.area1;
		var area2 = req.body.area2;
		var area3 = req.body.area3;

		if (name == undefined || name.length <=0 || name.length > 8) {
			res.status(400).send('invalid name');
		}
		
		var sql = 'UPDATE trip set name = ' + mysql.escape(name)
			+ ', start = ' + mysql.escape(start)
			+ ', end = ' + mysql.escape(end)
			+ ', area1 = ' + area1
			+ ', area2 = ' + area2
			+ ', area3 = ' + area3
			+ ' WHERE email = ' + mysql.escape(email) + ' AND _id = ' + tripID;
		
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else {
					if (results.changedRows != 0) res.status(201).send('update successful');
					else res.status(404).send('invalid email or trip id');
					}
				});
		});

tripsRouter.delete('/:email/:tripID', function(req, res, next) {
		var email = req.params.email;
		var tripID = req.params.tripID;
		
		var sql = 'DELETE FROM trip WHERE email = ' + mysql.escape(email) + ' AND _id = ' + tripID;

		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else {
					console.log(results);
					res.status(202).send('delete success');
				}
				});
		});

tripsRouter.use('/:email/:tripID/data/schedule', function(req, res, next) {
		req.email = req.params.email;
		req.tripID = req.params.tripID;
		next();
	}, scheduleRouter);

tripsRouter.use('/:email/:tripID/diary', function(req, res, next) {
		req.email = req.params.email;
		req.tripID = req.params.tripID;
		next();
	}, diaryRouter);
