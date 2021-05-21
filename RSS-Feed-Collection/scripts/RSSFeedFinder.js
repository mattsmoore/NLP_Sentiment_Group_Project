/* 
 * This is a script that reads in a new line
 * separated list of urls and attempts to find
 * RSS feed within the page.
 * It then writes the RSS feeds to a CSV output
 * file.
 */
const fs = require('fs');
const READFILE = 'EnglishNewsExPatch.txt';
const WRITEFILE = 'EnglishFeeds.csv';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { http } = require('follow-redirects');

// This could be optimized to run async
function request(url) {
	return new Promise((resolve, reject) => {
		console.log("Requesting:", url);
		const options = {
			host: url,
			timeout: 5000 
		};

		// Http request docs https://nodejs.dev/learn/making-http-requests-with-nodejs
		const req = http.request(options, function(res) {
			let data = '';
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				const dom = new JSDOM(data);
				const d = dom.window.document;
				const title = d.querySelector("title");
				let titleText = "";
				if (title) {
					titleText = title.textContent;
				}
				const rssFeed = d.querySelector("[type='application/rss+xml']");
				if (rssFeed) {
					// Remove new lines from title
					titleText = titleText.replace(/,/g, ' |');
					titleText = titleText.replace(/\r?\n|\r/g, '');
					const output = url+','+titleText+','+rssFeed.href+'\n';
					fs.appendFileSync(WRITEFILE, output);
				}
				resolve();
			});
		// Timing out http requests https://stackoverflow.com/a/55021202
		}).on('timeout', (r) => {
			req.abort();
		}).on("error", function(e){
			console.log("Got error: " + e.message);
			// Resolve anyway
			resolve();
		});
		req.end();
	});
}


(async function() {
	try {
		const file = fs.readFileSync(READFILE, 'UTF-8');
		const lines = file.split(/\r?\n/);
		for (const line of lines) {
			if (line != '') {
				await request(line);
			}
		}
	} catch (err) {
		console.log("Error:", err);
	}
})();
