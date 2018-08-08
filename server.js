const mongo = require('mongodb').MongoClient;
const port = process.env.PORT || 4000;
const client = require('socket.io').listen(port).sockets;
const MONGODBURI = 'mongodb://bradleyaw:Password1@ds115472.mlab.com:15472/datatree'

mongo.connect(MONGODBURI, function (err, dbs) {
    if (err) {
        reject(err);
    }
    console.log('Mongodb connected');

    client.on('connection', function (socket) {
        const dbTree = dbs.db('datatree').collection('factories');
        /*
        sendStatus = function (s) {
            socket.emit('status', s);
        }
        */
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
