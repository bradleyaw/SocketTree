//IIFE
(function () {

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
    var formMessage = document.getElementsByClassName('formMessage')
    var serverMessage = element('serverMessage')

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

            //On receipt of data
            socket.on('output', function (data) {
                if (data.length) {
                    // get the children of the root folder and remove them before populating refreshed data
                    var children = $("#jstree").jstree(true).get_node('root').children;
                    $("#jstree").jstree(true).delete_node(children);
                    // Also reset select option
                    selectFactory.options.length = 0;
                    for (var i = 0; i < data.length; i++) {
                        createNode("#root", "factory" + data[i].factory, data[i].factory);
                        //for each factory append option to select
                        var factoryName = document.createElement("option");
                        factoryName.text = data[i].factory;
                        factoryName.value = data[i].factory;
                        selectFactory.add(factoryName);
                        deleteContainer.appendChild(selectFactory);
                        deleteContainer.insertBefore(selectFactory, deleteContainer.firstChild);
                        for (var j = 0; j < data[i].childArr.length; j++) {
                            var childIndex = data[i].childArr[j]
                            if (childIndex == 0) {
                                childIndex = '0'
                            }
                            createNode("#factory" + data[i].factory, data[i].factory + String(j + 1), childIndex);
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
                generateArray(arr, arrayLength, lowerVal, upperVal);
                socket.emit('input', { factory: factoryInput.value, childArr: arr })
                if ((arr[0] || arr[0] === 0) && factoryInput.value.match(/^[\w]+$/)) {
                    $('#modal').modal('hide');
                }
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
                if (factoryUpdate.value.match(/^[\w]+$/)) {
                    $('#updateModal').modal('hide');
                }
            });

            // On update child array modal submit
            updateArray.addEventListener('click', function (event) {
                var arr = [];
                var arrayLength = selectUpdate.value;
                var lowerVal = Number(lowerUpdate.value);
                var upperVal = Number(upperUpdate.value);
                generateArray(arr, arrayLength, lowerVal, upperVal);
                socket.emit('updateArray', { oldfactory: selectFactory.value, childArr: arr })
                if (arr[0] || arr[0] === 0) {
                    $('#updateModal').modal('hide');
                }
            });

            // On receipt of server emitting status
            socket.on('status', function (data) {
                if (data.message.includes("Error:")) {
                    displayError(data.message);
                } else {
                    displaySuccess(data.message);
                }
            })
        }
    });

    // Adds nodes to the jsTree. Position can be 'first' or 'last'.
    function createNode(parent_node, new_node_id, new_node_text, position) {
        $('#jstree').jstree('create_node', $(parent_node), { "text": new_node_text, "id": new_node_id }, position, false, false);
    }

    // Generate array based on user input
    function generateArray(arr, numNodes, lowBound, uppBound) {
        if (uppBound >= lowBound && Number.isInteger(lowBound) && Number.isInteger(uppBound) && uppBound <= 999999999 && lowBound >= -999999999) {
            while (arr.length < numNodes) {
                function getRndInteger(min, max) {
                    return min + Math.floor(Math.random() * (max - min + 1));
                }
                var randomnumber = getRndInteger(lowBound, uppBound);
                arr[arr.length] = randomnumber;
            }
            arr.sort((a, b) => a - b);
            return arr
        } else {
            alert("Please ensure you have included a factory name and integer bounds")
        }
    }

    //function grab by ID
    function element(id) {
        return document.getElementById(id);
    }
    //display success status
    function displaySuccess(s) {
        serverMessage.textContent = s;
        if (s !== "") {
            setTimeout(function () {
                displaySuccess("");
            }, 5000)
        }
    }
    //display form error status
    function displayError(s) {
        if (s.includes("Update")) {
            formMessage[1].textContent = s;
        } else {
            formMessage[0].textContent = s;
        }
        if (s !== "") {
            setTimeout(function () {
                displayError("");
            }, 5000)
        }
    }

})();