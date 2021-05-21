const express = require('express');
const cors = require('cors');
const app = express();

// Create Sql connection
const mysql = require('mysql');
const mysqlOptions = {
    host: '####',
    port: '####',
    user: '####',
    password: '####',
    database: '####'
};


app.use(cors());
app.use(express.static('public'))

app.get('/api/search/', (req, res) => {
    const term = req.query.term;
    if (!term) {
        res.json({ "Error": "Search param required. ex: /api/search/?term=potato" });
    } else {
        let t ='%'+term+'%';
        const connection = mysql.createConnection(mysqlOptions);
        connection.query('SELECT DISTINCT `named_entity` FROM `named_entities` WHERE `named_entity` LIKE ?',[t],(err, results) => {
            if (err) {
                throw err;
            } else {
                connection.end();
                const relatedWords = JSON.stringify(results);
                res.json(relatedWords);
            }
        });
    }
});

app.get('/api/ne/', (req, res) => {
    const term = req.query.term;
    if (!term) {
        res.json({ "Error": "Term param required. ex: /api/ne/?term=potato" });
    } else {
        const t = term;
        const connection = mysql.createConnection(mysqlOptions);
        connection.query('SELECT * FROM `named_entities` WHERE `named_entity` = ?',[t],(err, results) => {
            if (err) {
                throw err;
            } else {
                connection.end();
                const named_entity = JSON.stringify(results);
                res.json(named_entity);
            }
        });
    }
});

const s = app.listen(4201, () => {
    console.log("Running NodeJS Server");
});
