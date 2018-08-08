//IIFE
(function () {
    //function grab by ID
    var element = function (id) {
        return document.getElementById(id);
    }
    //Grab relevant ids
    var status = element('status')
    var factories = element('factories')
    var submit = element('submit')
    var factory = element('factory')
    var select = element('select')
    var lower = element('lower')
    var upper = element('upper')
    var resetBtn = element('clear')

    //set status default as blank
    var statusDefault = status.textContent;

    // When status changes display for four seconds
    var setStatus = function (s) {
        status.textContent = s;

        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000)
        }
    }
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
                    console.log(data[i]);
                    var message = document.createElement('ul')
                    message.setAttribute('class', 'list-group mb-3');
                    var namehead = '<li class="list-group-item list-group-item-primary p-2">' + data[i].factory + '</li>'
                    for (var j = 0; j < data[i].childArr.length; j++) {
                        namehead += '<li class="list-group-item p-2 pl-3">' + data[i].childArr[j] + '</li>'
                    }
                    message.innerHTML = namehead;
                    factories.appendChild(message);
                    factories.insertBefore(message, factories.firstChild);
                }
            }
        });
        // On status change
        /*
        socket.on('status', function (data) {
            console.log('Client on status: ' + data);
            setStatus((typeof data === 'object') ? data.childArr : data)
            if (data.clear) {
                factories.value = "";
            }
        });
        */

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
            socket.emit('input', { factory: factory.value, childArr: arr })
            factory.value = '';
            lower.value = '';
            upper.value = '';
            select.value = 1;
        });
        // On reset button click
        resetBtn.addEventListener('click', function () {
            socket.emit('clear')
        })
        // On clear
        socket.on('cleared', function () {
            console.log("in cleared of client")
            //setStatus('Cleared')
            factories.innerHTML = '';
        })
    }
})();