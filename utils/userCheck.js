const mysql = require('mysql');
const SQLquery = require('./sqlQuery.js');

function userCheck(email, option) {
	return new Promise(function(resolve, reject) {
			if (email.charAt(0) != '"') email = '"' + email + '"';
			var sql = 'SELECT ' + option + ' FROM login WHERE email = ' + email;
			SQLquery(sql).then(function(results) {
					if (results == null) {
						resolve(null);
						}
					else if (results[0] == undefined) resolve(404);
					else resolve(results[0]);
					});
			});
}

module.exports = userCheck;
