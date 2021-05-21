# RSS Feed Collection

The following steps were taken to extract and create our RSS feed list.

## 1. Data Source:

We got our initial list of news websites from this page:

https://www.labnol.org/internet/sites-indexed-in-google-news/19323/

They list a url to a txt file containing a newline separated list:

https://img.ctrlq.org/files/Google-News.txt


## 2. Extracting:

### 1. Extracting English Only

We began by only taking the English sites from the file and then filtered them into a new file using grep and cut for formatting. This became our EnglishNews.txt file.

### 2. Removing Patch News

Looking over the dataset we removed all patch sites since we were able to download their RSS feeds from the patch home page: http://patch.com/rss. This is the patch.rss file. We then extracted the just the urls put them into patch-links.txt using grep and cut pipping.

The file without the patch urls became EnglishNewsExPatch.txt

### 3. Finding RSS Feeds

We then wrote the RSSFeedFinder.js script using node that reads in the EnglishNewExPatch.txt, finds all of the RSS feeds then saved them in EnglishFeeds.csv.

## 3. Adding Feeds to SQL database

We used CSVToDatabase.js to insert all of the RSS feeds found in EnglishFeeds.csv to the SQL database.

## 4. Continuously Collection Data From Feeds

We use the RSSFeedReader.js to read from all of the RSS feeds and add a new row to the database for each item found in an RSS feed.

## Conclusion

We have two large lists of RSS feeds (EnglishFeeds.csv and PatchFeeds.txt) which we are able to collect data from. Excluding the patch feeds we have 2289 English RSS feeds.
