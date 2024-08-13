export function createGrid() {
    let arr = []
    let start = Date.now()

    for (let row = -100; row <= 100; row++) {
        arr[row] = []
        for (let col = -100; col <= 100; col++) {
            arr[row][col] = { data: Math.random() * 100 < 25 ? 'bomb' : 0, checked: false }
        }
    }
    for (let row = -100; row <= 100; row++) {
        for (let col = -100; col <= 100; col++) {
            if (arr[row][col].data === 'bomb') { for (let r = row - 1; r <= row + 1; r++) { if (arr[r]) { for (let c = col - 1; c <= col + 1; c++) { addData(arr, r, c) } } } }
        }
    }
    console.log('time to build the grid:', Date.now() - start, 'ms')

    return arr
}
function addData(arr, row, col) { if (checkExistNotBoumb(arr, row, col)) arr[row][col].data++ }
function checkExistNotBoumb(arr, row, col) { return arr[row][col] && arr[row][col].data !== 'bomb' }
export function expandGrid(arr, r, c){
    let start = Date.now()

    for (let row = -100 + r; row <= 100 + r; row++) {
        if(!arr[row])arr[row] = []
        for (let col = -100 + c; col <= 100 + c; col++) {
            arr[row][col] = { data: Math.random() * 100 < 25 ? 'bomb' : 0, checked: false }
        }
    }
    for (let row = -101 + r; row <= 101 + r; row++) {
        if(!arr[row])continue;
        for (let col = -101 + c; col <= 101 + c; col++) {
            if(!arr[row][col])continue
            if (arr[row][col].data === 'bomb') { for (let r = row - 1; r <= row + 1; r++) { if (arr[r]) { for (let c = col - 1; c <= col + 1; c++) { addData(arr, r, c) } } } }
        }
    }
    console.log('time to expand the grid:', Date.now() - start, 'ms')

    return arr
}