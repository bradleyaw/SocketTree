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

        statusChange = function (s) {
            socket.emit("status", s);
        }

        // On user input add to db and emit data to all sockets
        socket.on('input', function (data) {
            dbTree.findOne({ factory: data.factory }, function (err, result) {
                if (result) {
                    statusChange({ message: "Error: Entry duplicate - not added to db" })
                } else if (!data.childArr.some(isNaN) && data.childArr.length <= 15 && data.factory.match(/^[\w]+$/)) {
                    dbTree.insert({ factory: data.factory, childArr: data.childArr }, function () {
                        outputData(dbTree, client);
                        statusChange({ message: "Entry added" })
                    })
                } else {
                    statusChange({ message: "Error: Input not valid" })
                }
            })
        })

        //Update Name
        socket.on('updateName', function (data) {
            dbTree.findOne({ factory: data.factory }, function (err, result) {
                if (result) {
                    statusChange({ message: "Error: Entry duplicate - not added to db" })
                } else if (data.factory.match(/^[\w]+$/)){
                    dbTree.updateOne({ factory: data.oldfactory }, { $set: { factory: data.factory } }, function () {
                        outputData(dbTree, client);
                        statusChange({ message: "Name updated" })
                    })
                } else {
                    statusChange({ message: "Error: Update is not valid" })
                }
            })

        })

        //Update Array
        socket.on('updateArray', function (data) {
            if (!data.childArr.some(isNaN) && data.childArr.length <= 15) {
                dbTree.updateOne({ factory: data.oldfactory }, { $set: { childArr: data.childArr } }, function () {
                    outputData(dbTree, client);
                    statusChange({ message: "Array Updated" })
                })
            } else {
                statusChange({ message: "Error: Update input values not valid" })
            }
        })

        // On clear button press delete all documents from Mongo and emit update to all sockets
        socket.on('clear', function (clearData) {
            dbTree.deleteMany({}, function () {
                statusChange({ message: "Data tree cleared" })
                client.emit('cleared')
            })
        })
        //On delete button press, delete document that matches the name in the select box
        socket.on('delete', function (deleteData) {

            dbTree.deleteOne({ factory: String(deleteData) }, function () {
                outputData(dbTree, client);
                statusChange({ message: "entry deleted successfully" })
            })
        })
    });
});