/*
 * This script inserts the CSV filet into the database
 */

// Read file
const fs = require('fs');
const data = fs.readFileSync('../files/EnglishFeeds.csv', 'utf-8')
const lines = data.split('\n');

// This is from the documentation page: https://github.com/mysqljs/mysql#introduction
const mysql = require('mysql');
const connection = mysql.createConnection({
	  host     : '####',
		port		 : '####',
	  user     : '####',
	  password : '####',
	  database : '####'
});

connection.connect();

const values = [];
for (line of lines) {
	const arr = line.split(',');
	if (arr.length == 3 && arr[2]) {
		arr[1] = arr[1].substr(0,255);
		if (arr[2].match(/^\//) || arr[2].match(/^rss/) || arr[2].match(/^\.\./)) {
			arr[2] = arr[0]+arr[2];
		}
		values.push(arr);
	} else {
		console.log("ERR", arr);
	}
}

connection.query('INSERT INTO feeds (origin,title,url) VALUES ?', [values], (err) => {
	if (err) {
		throw err;
	} else {
		console.log('RSS feeds successfully added');
	}
	connection.end();
});
