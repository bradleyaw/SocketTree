//if statement to validate bounds for Array creation and that factory name exists

generateArray([], 7, 10, 20)
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
        console.log(arr);
        return arr
    } else {
        console.log("problem with inputs")
    }
}