// create app
var fs = require('fs');
const credentials = {
    key: fs.readFileSync('./key.pem', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
};

const express = require("express");
var app = require('express')(),
        server = require('https').createServer(credentials, app),
        io = require('socket.io').listen(server),
        ent = require('ent');

// public files
app.use(express.static('public'));
app.use('/moment', express.static(__dirname + '/node_modules/moment/min')); // redirect moment
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/bootstrap/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));

// DB
var MongoClient = require('mongodb').MongoClient;
var database_url = "mongodb://localhost:27017/";
var database_name = "doorguard";
var collection = "checks";

var db_error = false;

// create db and collection
MongoClient.connect(database_url)
        .then(db => {
            var dbo = db.db(database_name);
            dbo.createCollection(collection)
                    .then(() => db.close());
        })
        .catch(err => {
            db_error = err;
            console.log(err);
        });


// socket.io
io.sockets.on('connection', function (socket) {

    // start
    socket.on('start', function () {
        var response = {code: 0};
        if (db_error) {
            response.code = -1;
            response.error = db_error;
        }
        socket.emit('started', response);
    });

    // insert measurements into db
    socket.on('insert', function (data) {
        // {time: <time>, door: <int>, value: <0|1>}
        var response = {code: 0};
        MongoClient.connect(database_url)
                .then(db => {
                    var dbo = db.db(database_name);
                    dbo.collection(collection).insertOne(data)
                            .then(() => {
                                console.log("A new check was inserted!");
                                socket.emit('inserted', response);
                                socket.broadcast.emit('inserted', response);
                            }).then(() => db.close());
                })
                .catch(err => {
                    console.log(err);
                    response.code = -1;
                    response.error = err;
                    socket.emit('inserted', response);
                });
    });

    // find measurements
    socket.on('find', function (search) {
        var response = {code: 0};
        MongoClient.connect(database_url)
                .then(db => {
                    var dbo = db.db(database_name);
                    var sort = {time: -1};
                    if (search.start > -1 && search.pager > 0) {
                        dbo.collection(collection).find().sort(sort)
                            .skip(search.start).limit(search.pager)
                            .toArray().then(data => {
                                response.values = data;
                                dbo.collection(collection).aggregate([{
                                    $group: {
                                        _id: '$door',
                                        origId: { $last: '$_id' },
                                        value: { $last: '$value' },
                                        time: {$last: '$time'}
                                    },
                                 }, {
                                    $project: {
                                        _id : '$origId',
                                        time: '$time',
                                        door: '$_id',
                                        value: '$value'
                                    }
                                }]).toArray().then(data => {
                                    response.statuses = data;
                                    socket.emit('found', response);
                                });
                            }).then(() => db.close());
                    } else {
                        throw("ricerca non valida");
                    }
                })
                .catch(err => {
                    console.log(err);
                    response.code = -1;
                    response.error = err;
                    socket.emit('found', response);
                });
    });

});

// start server
server.listen(8080);
