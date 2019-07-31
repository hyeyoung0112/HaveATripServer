// require needed modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const SQLquery = require('../utils/sqlQuery.js');

// make info router and export
const infoRouter = express();
module.exports = infoRouter;

infoRouter.post('/', (req, res, next) => {
		// get necessary data for posting tour information
		var type = req.body.type;
		var areaCode = req.body.areaCode;
		
		var name = req.body.name;
		var detail = req.body.detail;
		var info = req.body.info;
		var pic = req.body.pic;

		var table = type + '_info';
		
		// check if all input data are valid
		if (name.length == 0 || name.length > 30) {
			res.status(400);
			res.send(name + ' is too long');
			return;
		}

		var sql = 'INSERT INTO ' + table + ' (areaCode, name, detail, info, imageurl) VALUES ('
				+ mysql.escape(areaCode) + ', ' + mysql.escape(name) + ', '
				+ mysql.escape(JSON.stringify({'detail': detail})) + ', ' + mysql.escape((JSON.stringify({'info': info}))) + ', ' + mysql.escape(pic) + ')';
		SQLquery(sql).then(function(error, results, fields) {
				if (error) {
					// failure due to server problems
					console.log(error);
					res.status(503);
					res.send(name + ' post failed.');
				}
				else {
					console.log(JSON.stringify(results));
					res.status(201);
					res.send(name + ' post successful');
				}
		});
		
		return;
});

infoRouter.get('/area/:type/:areaCode', (req, res, next) => {
		var type = req.params.type;
		var areaCode = req.params.areaCode;

		var sql = 'SELECT _id, name, addr FROM ' + type + '_info WHERE areaCode = ' + areaCode;
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('server failure');
				}
				else {
					res.status(200).send(results);
				}
				});
		});

infoRouter.get('/full/:type/:id', (req, res, next) => {
		var type = req.params.type;
		var id = req.params.id;

		var sql = 'SELECT * FROM ' + type + '_info WHERE _id = ' + id;
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('failure due to server errors');
				}
				else if (results[0] != undefined) {
					res.status(200).send(results[0]);
				}
				else {
					res.status(404).send('invalid id');
				}
			});
		});

infoRouter.get('/brief/:type/:id', (req, res, next) => {
		var type = req.params.type;
		var id = req.params.id;
		
		var sql = 'SELECT _id, name, addr FROM ' + type + '_info WHERE _id = ' + id;
		SQLquery(sql).then(function(results) {
				if (results == null) {
					res.status(503).send('failure due to server errors');
				}
				else if (results[0] != undefined) {
					res.status(200).send(results[0]);
				}
				else {
					res.status(404).send('invalid id');
				}
				});
});
