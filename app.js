const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ThesisRepo = require('./models/thesis');
const { Copyleaks } = require('plagiarism-checker');  
const fs = require('fs');

const app = express();

const copyleaks = new Copyleaks();

let thesisrepo = new ThesisRepo();

let results = {name: '', score: '', totalWords: '', identicalWords: '', relatedMeaningWords: '', minorChangedWords: ''};

/*copyleaks.loginAsync('nidhishgambhir@gmail.com','f33d926e-e2a0-48ce-b182-f54c5cfb6ec7')
    .then(res=> {
        console.log(res);
    } , err=> {});*/

const dbURI = 'mongodb+srv://root:root@plagchecker.zupi6lg.mongodb.net/PlagChecker?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

app.set('view engine', 'ejs');
// app.set('views', 'myviews');

app.use(express.static('static'));
app.use(express.urlencoded({extended: true}));

// content-type header
var customParser = bodyParser.json({type: function(req) {
    if (req.headers['content-type'] === ""){
        return req.headers['content-type'] = 'application/json';
    }
    else if (typeof req.headers['content-type'] === 'undefined'){
        return req.headers['content-type'] = 'application/json';
    }else{
        return req.headers['content-type'] = 'application/json';
    }
}});


app.use(bodyParser.json({
  limit: '50mb',
  extended: true
})); // support encoded bodies

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
})); // support encoded bodies

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/checker', (req, res) => {
    res.render('checker');
});

app.post('/checker', (req, res) => {

    thesisrepo = new ThesisRepo(req.body);
    results.name = req.body.name;
    fs.writeFileSync('./file.txt', req.body.thesis);
    plagCheck();
    setTimeout(() => {res.render('result', results)}, 20000);

});

app.post('/completed/scan', customParser, (req, res) => {
    
    results.score = req.body.results.score.aggregatedScore;
    results.totalWords = req.body.scannedDocument.totalWords;
    results.identicalWords = req.body.results.score.identicalWords;
    results.relatedMeaningWords = req.body.results.score.relatedMeaningWords;
    results.minorChangedWords = req.body.results.score.minorChangedWords;
    let internet = req.body.results.internet.slice();
    results.internet = internet;
    // console.log(results.internet);

    if(results.score < 5) {
        thesisrepo.save()
            .then((result) => {
                console.log('saved to db');
            })
            .catch((err) => {
                console.log(err);
            });
    }
    res.end();

});

app.get('/result', (req, res) => {
    res.render('redirect');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/faq', (req, res) => {
    res.render('faq');
});

app.get('/result', (req, res) => {
    res.render('result');
});

app.use((req, res) => {
    res.status(404).render('404');
});

plagCheck = () => {
    let tk = '';
    let content = '';

    fs.readFile('./file.txt', (err, data) => {
    if(err) {
        console.log(err);
    } else {
        content = data.toString('base64');
    }
    });

    copyleaks.loginAsync('nidhishgambhir@gmail.com','f33d926e-e2a0-48ce-b182-f54c5cfb6ec7')
    .then(res=> {
        console.log(res.access_token);
        tk = res.access_token;
    } , err=> {});

    setTimeout(() => {
        var request = require('request');

        headers = {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${tk}`
        };


        var dataString = '{ \
        "base64": "' +content+ '", \
        "filename": "file.txt", \
        "properties": { \
        "sandbox": true, \
        "webhooks": { \
            "status": "https://826a-223-178-213-107.ngrok-free.app/{STATUS}/scan" \
        } \
        } \
        }';
        
        const url = 'https://api.copyleaks.com/v3/scans/submit/file/testscan-' + (Math.floor(Math.random() * 1001));

        var options = {
            url: url,
            method: 'PUT',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
        }

        request(options, callback);
        return "Done";
        //console.log(options);
    }, 5000);

}