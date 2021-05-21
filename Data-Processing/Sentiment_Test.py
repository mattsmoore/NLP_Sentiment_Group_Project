import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import mysql.connector
import time
import sys
from datetime import date

mydb = mysql.connector.connect(
  host="####",
  port="####",
  user="#####",
  password="####",
  database="####"
)

# Default current date
config = "CURRENT"
if (len(sys.argv) == 2):
    config = sys.argv[1]

alldates = []
today = date.today()
alldates.append((today,))

if (config == "ALL"):
    myquery = mydb.cursor()
    myquery.execute("SELECT DISTINCT date(`update`) FROM `news-data`")
    alldates = myquery.fetchall()
    myquery.close()

vals = []

def get_ne_by_date(date):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT `title` FROM `news-data` WHERE date(`update`) = %s", (date,))
    myresult = mycursor.fetchall()
    mycursor.close()

    sia = SentimentIntensityAnalyzer()

    named_entities = []
    counts = []
    scores = []

    for result in myresult:
        parse_tree = nltk.ne_chunk(nltk.tag.pos_tag(result[0].split()), binary=True)
        score = sia.polarity_scores(result[0])

        for t in parse_tree.subtrees():
            if t.label() == 'NE':
                if list(t)[0][0].lower() in named_entities:
                    k = named_entities.index(list(t)[0][0].lower())
                    counts[k] += 1
                    scores[k] += score['compound']
                else:
                    named_entities.append(list(t)[0][0].lower())
                    counts.append(1)
                    scores.append(score['compound'])


    for x in named_entities:
        name = x
        score = scores[named_entities.index(x)]
        count = counts[named_entities.index(x)]

        vals.append((name,str(score),date,date,str(count)))
        #print(x)

for date in alldates:
    date_formatted = date[0].strftime('%Y-%m-%d')
    print("Processing: ",date_formatted)
    get_ne_by_date(date_formatted)

mycursor = mydb.cursor()
sql = "INSERT INTO `named_entities` VALUES (DEFAULT,%s,%s,%s,%s,%s)"
mycursor.executemany(sql,vals)
mydb.commit()
print(mycursor.rowcount, "was inserted.")
mycursor.close()
mydb.close()
