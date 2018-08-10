//IIFE
(function () {
    //function grab by ID
    var element = function (id) {
        return document.getElementById(id);
    }
    //Grab relevant ids
    var submit = element('submit')
    var factoryInput = element('factoryInput')
    var selectInput = element('select')
    var lower = element('lower')
    var upper = element('upper')
    var resetBtn = element('clear')
    var deleteContainer = element('deleteContainer')
    var deleteBtn = element('delete')
    var selectFactory = element('selectFactory')
    var jstree = element('jstree')
    var update = element('update')
    var updateData = element('updateData')
    var lowerUpdate = element('lowerUpdate')
    var upperUpdate = element('upperUpdate')
    var selectUpdate = element('selectUpdate')
    var factoryUpdate = element('factoryUpdate')


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
                if (data.length) {
                    console.log(data.length);
                    // get the children of the root folder and remove them before populating refreshed data
                    var children = $("#jstree").jstree(true).get_node('root').children;
                    $("#jstree").jstree(true).delete_node(children);
                    // Also reset select option
                    selectFactory.options.length = 0;

                    for (var i = 0; i < data.length; i++) {
                        console.log(data[i].factory);
                        createNode("#root", "factory" + data[i].factory + String(i + 1), data[i].factory);
                        //for each factory append option to select
                        var factoryName = document.createElement("option");
                        factoryName.text = data[i].factory;
                        factoryName.value = data[i].factory;
                        selectFactory.add(factoryName);
                        deleteContainer.appendChild(selectFactory);
                        deleteContainer.insertBefore(selectFactory, deleteContainer.firstChild);
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
                var arrayLength = selectInput.value;
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
                socket.emit('input', { factory: factoryInput.value, childArr: arr })
                factoryInput.value = 'John';
                lower.value = 1;
                upper.value = 100;
                selectInput.value = 1;
            });
            // On reset button click
            resetBtn.addEventListener('click', function () {
                socket.emit('clear')
            })

            // On clear after server process
            socket.on('cleared', function () {
                $('#jstree').jstree("refresh");
                selectFactory.options.length = 0;
            })

            // On delete button click
            deleteBtn.addEventListener('click', function () {
                socket.emit('delete', [selectFactory.value])
            })

            //On Update button click
            update.addEventListener('click', function (event) {
                factoryUpdate.value = selectFactory.value
            });

            // On update factory name modal submit
            updateName.addEventListener('click', function (event) {
                socket.emit('updateName', { oldfactory: selectFactory.value, factory: factoryUpdate.value })
            });

            // On update child array modal submit
            updateArray.addEventListener('click', function (event) {
                var arr = [];
                var arrayLength = selectUpdate.value;
                var lowerVal = Number(lowerUpdate.value);
                var upperVal = Number(upperUpdate.value);
                while (arr.length < arrayLength) {
                    function getRndInteger(min, max) {
                        return min + Math.floor(Math.random() * (max - min + 1));
                    }
                    var randomnumber = getRndInteger(lowerVal, upperVal);
                    arr[arr.length] = randomnumber;
                }
                arr.sort((a, b) => a - b);
                socket.emit('updateArray', { oldfactory: selectFactory.value, childArr: arr })
            });
        }
    });

    // Adds nodes to the jsTree. Position can be 'first' or 'last'.
    function createNode(parent_node, new_node_id, new_node_text, position) {
        $('#jstree').jstree('create_node', $(parent_node), { "text": new_node_text, "id": new_node_id }, position, false, false);
    }

})();