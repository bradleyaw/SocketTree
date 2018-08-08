const mongo = require('mongodb').MongoClient;
const path = require("path"); //new
const port = process.env.PORT || 4000;
//const client = require('socket.io').listen(socketPort).sockets;
//console.log('Socket server running on port: ' + socketPort)
const MONGODBURI = 'mongodb://bradleyaw:Password1@ds115472.mlab.com:15472/datatree'

//const app = require('express')();
//const server = require('http').createServer(app);
//const client = require('socket.io')(server);
//server.listen(port);

var app = require('express')();
var http = require('http').Server(app);
var client = require('socket.io')(http);


//new
app.get("/", function(req, res) {
    console.log("Server app.get /")
    res.sendFile(path.join(__dirname, "./index.html"));
  });


http.listen(port, function(){
    console.log('listening on *:' + port);
});


mongo.connect(MONGODBURI, function (err, dbs) {
    if (err) {
        reject(err);
    }
    console.log('Mongodb connected');

    client.on('connection', function (socket) {
        console.log("Server on connect")
        const dbTree = dbs.db('datatree').collection('factories');

        dbTree.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }
            console.log(res);
            socket.emit('output', res);
        });

        socket.on('input', function (data) {
            let factory = data.factory;
            let childArr = data.childArr;

            if (factory == '' || childArr == '') {
            } else {
                dbTree.insert({ factory: factory, childArr: childArr }, function () {
                    client.emit('output', [data]);
                })
            }
        })

        socket.on('clear', function (data) {
            console.log('Server Clear')
            dbTree.deleteMany({}, function () {
                console.log('Server emitting cleared')
                client.emit('cleared')
            })
        })
    });
});