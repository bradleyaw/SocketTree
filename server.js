const mongo = require('mongodb').MongoClient;
<<<<<<< HEAD
const port = process.env.PORT || 4000;
const client = require('socket.io').listen(port).sockets;
const MONGODBURI = 'mongodb://bradleyaw:Password1@ds115472.mlab.com:15472/datatree'

=======
const path = require("path");
const port = process.env.PORT || 4000;

const MONGODBURI = 'mongodb://bradleyaw:Password1@ds115472.mlab.com:15472/datatree'

var express = require('express');
var app = express();
var http = require('http').Server(app);
var client = require('socket.io')(http);

app.use(express.static('client'))

app.get("/", function (req, res) {
    console.log("Server app.get /")
    res.sendFile(path.join(__dirname, "./client/index.html"));
});


http.listen(port, function () {
    console.log('listening on *:' + port);
});


>>>>>>> refs/remotes/origin/master
mongo.connect(MONGODBURI, function (err, dbs) {
    if (err) {
        reject(err);
    }
    console.log('Mongodb connected');

    client.on('connection', function (socket) {
<<<<<<< HEAD
        const dbTree = dbs.db('datatree').collection('factories');
        /*
        sendStatus = function (s) {
            socket.emit('status', s);
        }
        */
=======
        console.log("Server on connect")
        const dbTree = dbs.db('datatree').collection('factories');

>>>>>>> refs/remotes/origin/master
        dbTree.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }
            console.log(res);
            socket.emit('output', res);
        });

<<<<<<< HEAD
        socket.on('input', function (data) {
            let factory = data.factory;
            let childArr = data.childArr;

            if (factory == '' || childArr == '') {
                //sendStatus('Please enter a factory name and lower and upper bounds');
            } else {
                dbTree.insert({ factory: factory, childArr: childArr }, function () {
                    client.emit('output', [data]);
                    /*
                    sendStatus({
                        message: 'Factory added',
                        clear: true
                    })
                    */
                })
            }
        })

        socket.on('clear', function (data) {
            console.log('Server Clear')
            dbTree.deleteMany({}, function () {
                console.log('Server emitting cleared')
                socket.emit('cleared')
            })
            //sendStatus('Cleared');
        })
    });
});
=======
        // On user input add to db and emit data to all sockets
        socket.on('input', function (data) {
            console.log(data);
            //console.log(dbTree.find({factory : data.factory}))
            //if (dbTree.find({factory : data.factory})) {
            //    console.log("exists");
            //} else {
                dbTree.insert({ factory: data.factory, childArr: data.childArr }, function () {
                    client.emit('output', [data]);
                })
            //}
        })

        // On clear button press delete all documents from Mongo and emit update to all sockets
        socket.on('clear', function (clearData) {
            console.log('Server Clear')
            dbTree.deleteMany({}, function () {
                console.log('Server emitting cleared')
                client.emit('cleared')
            })
        })

        socket.on('delete', function (deleteData) {
            console.log('Server Delete: ' + deleteData);
            dbTree.deleteOne({ factory: String(deleteData) }, function () {
                console.log('Server emitting deleted')
                client.emit('deleted', [deleteData])
            })
        })
    });
});
>>>>>>> refs/remotes/origin/master
