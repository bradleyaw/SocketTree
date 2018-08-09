//IIFE
(function () {
    //function grab by ID
    var element = function (id) {
        return document.getElementById(id);
    }
    //Grab relevant ids
    var submit = element('submit')
    var factory = element('factory')
    var select = element('select')
    var lower = element('lower')
    var upper = element('upper')
    var resetBtn = element('clear')
    var deleteBtn = element('delete')
    var jstree = element('jstree')

    //Load jsTree JQuery
    $(function () {
        $('#jstree').jstree({
            'plugins': ["state"],
            'core': {
                "themes": {
                    "variant": "large"
                },
                'data': [{
                    "id": "root",
                    "text": "Root",
                    "state": {
                        "opened": true
                    }
                }],
                'check_callback': true
            }
        });
    });

    // When the jsTree is ready...
    $('#jstree').on('ready.jstree', function (e, treeData) {

        //set up socket connection
        var socket = io();

        // Connected to socket
        if (socket !== undefined) {
            console.log('Connected to socket...')

            //On receipt of data
            socket.on('output', function (data) {

                console.log(data);
                if (data.length) {
                    for (var i = 0; i < data.length; i++) {
                        createNode("#root", "factory" + data[i].factory + String(i + 1), data[i].factory);
                        console.log("factory" + String(i + 1));
                        for (var j = 0; j < data[i].childArr.length; j++) {
                            createNode("#factory" + data[i].factory + String(i + 1), data[i].factory + String(j + 1), data[i].childArr[j]);
                        }
                    }
                }
            });

            //On Add Factory modal form submit
            submit.addEventListener('click', function (event) {
                var arr = [];
                var arrayLength = select.value;
                var lowerVal = Number(lower.value);
                var upperVal = Number(upper.value);
                while (arr.length < arrayLength) {
                    function getRndInteger(min, max) {
                        return min + Math.floor(Math.random() * (max - min + 1));
                    }
                    var randomnumber = getRndInteger(lowerVal, upperVal);
                    arr[arr.length] = randomnumber;
                }
                arr.sort((a, b) => a - b);
                console.log(factory.value)
                socket.emit('input', { factory: factory.value, childArr: arr })
                factory.value = 'John';
                lower.value = 1;
                upper.value = 100;
                select.value = 1;
            });
            // On reset button click
            resetBtn.addEventListener('click', function () {
                socket.emit('clear')
            })
            // On clear after Server process
            socket.on('cleared', function () {
                console.log("in cleared of client")
                $('#jstree').jstree("refresh");

            })
            deleteBtn.addEventListener('click', function () {
                deleteData = 'factoryAlex1' //needs to be a field in mongo or change to other.
                socket.emit('delete', [deleteData])
            })
            socket.on('deleted', function (deletedData) {
                console.log("Deleted data: " + deletedData);
                $('#jstree').jstree().delete_node([deletedData]);
            })

        }
    });

    // Helper method createNode(parent, id, text, position).
    // Dynamically adds nodes to the jsTree. Position can be 'first' or 'last'.
    function createNode(parent_node, new_node_id, new_node_text, position) {
        $('#jstree').jstree('create_node', $(parent_node), { "text": new_node_text, "id": new_node_id }, position, false, false);
    }

})();