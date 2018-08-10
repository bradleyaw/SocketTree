const mongo = require('mongodb').MongoClient;
const path = require("path");
const port = process.env.PORT || 4000;

const MONGODBURI = 'mongodb://bradleyaw:Password1@ds115472.mlab.com:15472/datatree'

var express = require('express');
var app = express();
var http = require('http').Server(app);
var client = require('socket.io')(http);

app.use(express.static('client'))

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/index.html"));
});


http.listen(port, function () {
    console.log('listening on *:' + port);
});

function outputData(dbTree, dest) {
    dbTree.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
        if (err) {
            throw err;
        }
        dest.emit('output', res);
    });
}

mongo.connect(MONGODBURI, function (err, dbs) {
    if (err) {
        reject(err);
    }
    console.log('Mongodb connected');

    client.on('connection', function (socket) {
        const dbTree = dbs.db('datatree').collection('factories');

        outputData(dbTree, socket);

        // On user input add to db and emit data to all sockets
        socket.on('input', function (data) {
            console.log(data);
            dbTree.findOne({ factory: data.factory }, function (err, result) {
                if (result) {
                    console.log("Entry duplicate - not added to db")
                } else {
                    dbTree.insert({ factory: data.factory, childArr: data.childArr }, function () {
                        outputData(dbTree, client);
                    })
                }
            })
        })

        //Update Name (updates correctly, but async with jsTree.)
        socket.on('updateName', function (data) {
            console.log(data);
            dbTree.findOne({ factory: data.factory }, function (err, result) {
                if (result) {
                    console.log("Entry duplicate - not added to db")
                } else {
                    dbTree.updateOne({ factory: data.oldfactory }, { $set: { factory: data.factory } }, function () {
                        outputData(dbTree, client);
                    })
                }
            })

        })

    //Update Array (updates correctly, but async with jsTree.)
    socket.on('updateArray', function (data) {
        console.log(data);
        dbTree.updateOne({ factory: data.oldfactory }, { $set: { childArr: data.childArr } }, function () {
            outputData(dbTree, client);
        })
    })

    // On clear button press delete all documents from Mongo and emit update to all sockets
    socket.on('clear', function (clearData) {
        dbTree.deleteMany({}, function () {
            client.emit('cleared')
        })
    })
    //On delete button press, delete document that matches the name in the select box
    socket.on('delete', function (deleteData) {
        dbTree.deleteOne({ factory: String(deleteData) }, function () {
            outputData(dbTree, client);
        })
    })
});
});