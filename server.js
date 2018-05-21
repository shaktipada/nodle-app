'use strict';

const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
const randomstring = require('randomstring');
const appConfig = require('config');
const http = require('http');
const cluster = require('cluster');
const cpus = require('os').cpus().length;

const app = express();

app.use(require('method-override')());
app.use(require('helmet')());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH");
    process.env.REQ_ID = randomstring.generate(10) + moment().format('DDMMYY');
    process.env.REQ_URI = req.url;
    console.log(`>>>>> ${process.env.REQ_ID} __--> ${process.env.REQ_URI} <<<<<`);
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(responseInterceptor);

app.use(`/api`, require("./route"));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodle-app');

/* app.use(function (req, res, next) {
    console.log(">>>>>>>>>>>>");
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    console.log("h1");
    db.once('open', function callback() {
        console.log("h");
    });
    res.render('test');
    next();
});

app.get('/', function (req, res, next) {
    res.send({ "test": "test" });
}) */
app.all('*', function (req, res) {
    console.log("url not found", req.url);
    return res.send({ 'status': 404, 'error': 'Resource Not Found' });
});

/**
 * Create HTTP server.
 */
if (cluster.isMaster) {
    var workers = [];
    var spawnWorker = function (i) {
        workers[i] = cluster.fork();
        workers[i].on('online', function (worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
        }).on('exit', function (worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            console.log('Starting a new worker');
            spawnWorker(i);
        });
    };
    for (let i = 0; i < cpus; i++) spawnWorker(i);
    process.on('SIGINT', function (msg) { process.exit(0); });
} else {
    let server = http.createServer(app).listen(appConfig.app.port || '3006')
    server.on('error', (error) => {
        // handle specific listen errors with friendly messages
        if (error.syscall !== 'listen') throw error;
        var addr = server.address();
        var bind = (typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port);
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }).on('listening', () => {
        // Event listener for HTTP server "listening" event.
        var addr = server.address();
        var bind = (typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port);
        console.log(`nodle-app ${appConfig.mode} mode running, listening on ${bind}`);
    });
}


module.exports = app;