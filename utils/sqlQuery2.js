const mysql = require('mysql');

const mysqlQuery = function(sql) {
	return new Promise(function(resolve, reject) {
		const connection = mysql.createConnection({
				host: 'localhost',
				user: 'YOUR_MYSQL_USER',
				password: 'YOUR_MYSQL_PASSWORD',
				database: 'YOUR_MYSQL_DATABASE'
				});
		connection.connect();

		connection.query(sql, function(error, results, fields) {
				if (error) {
					console.log(error);
					resolve(null);
				}
				else resolve(results);
				});
		connection.end();
	});
}

module.exports = mysqlQuery;
