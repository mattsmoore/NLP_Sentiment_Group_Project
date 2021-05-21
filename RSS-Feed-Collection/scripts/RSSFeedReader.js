/*
 * This file reads all of the RSS feeds
 * from the database gets the data from their url
 * then writes it to the database
 */
const striptags = require('striptags');
const parser = require('fast-xml-parser');
const { decode } = require('html-entities');
const { http } = require('follow-redirects');
const crypto = require("crypto");
const URL = require('url');

const MAX_CONNECTIONS = 8;
let data = [];

// This is from the documentation page: https://github.com/mysqljs/mysql#introduction
const mysql = require('mysql');
const mysqlOptions = {
	  host     : '####',
		port		 : '####',
	  user     : '####',
	  password : '####',
	  database : '####'
};
const connection = mysql.createConnection(mysqlOptions);

// Get RSS Feed List
connection.query('SELECT `id`, `url` FROM `feeds`', (err, results) => {
	if (err) {
		throw err;
	} else {
		connection.end();
		feeds = results;
		requestLoop();
	}
});

// Here is where I got the idea for limited number of async requests
// https://stackoverflow.com/a/47299802
let connections = 0;
function requestLoop() {
	++connections;
	let url = feeds.pop();
	if (url) {
		const req = request(url.id, url.url).then(result => {
			requestLoop();
		}).catch(err => {
			console.log("ERR", err);
			requestLoop();
		});
		if (connections <= MAX_CONNECTIONS) {
			requestLoop();
		}
	} else {
		console.log('End of list');
	}
}

function clean(str) {
	return striptags(decode(String(str)))
}

// Copied from RSSFeedFinder.js
function request(id, url) {
	return new Promise((resolve, reject) => {
		console.log("Requesting:", url);
		parsedUrl = URL.parse(url);
		const options = {
			host: parsedUrl.host,
			timeout: 5000,
			path: parsedUrl.path
		};

		// Http request docs https://nodejs.dev/learn/making-http-requests-with-nodejs
		const req = http.request(options, function(res) {
			let data = '';
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				let rssFeed = false;
				if (parser.validate(data) === true) {
					rssFeed = parser.parse(data);
				} else {
					console.log("INVALID RSS");
				}
				if (
					rssFeed &&
					rssFeed.rss &&
					rssFeed.rss.channel &&
					rssFeed.rss.channel.item &&
					Array.isArray(rssFeed.rss.channel.item)
				) {
					const items = rssFeed.rss.channel.item;
					const values = [];
					for (item of items) {
						const hash = crypto
							.createHash("sha256")
							.update(item.title+item.description)
							.digest("hex");
						let pubDate = (new Date()).toLocaleString();
						if (item.pubDate) {
							pubDate = new Date(item.pubDate).toLocaleString();
						}
						const arr = [id, hash, clean(item.title), clean(item.description), pubDate];
						values.push(arr);
					}
					insertData(values);
				}
				resolve();
			});
			// Timing out http requests https://stackoverflow.com/a/55021202
		}).on('timeout', (r) => {
			req.abort();
		}).on("error", function(e){
			console.log("Got error: " + e.message);
			reject();
		});
		req.end();
	});
}

function insertData(values) {
	const c = mysql.createConnection(mysqlOptions);
	c.query('INSERT IGNORE INTO `news-data` (feed_id, hash, title, description, date) VALUES ?', [values], (err) => {
		if (err) {
			console.log("Database Err", err);
		}
		c.end();
	})
}
