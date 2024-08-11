export function createGrid() {
    let arr = []
    let start = Date.now()

    for (let row = -100; row <= 100; row++) {
        arr[row] = []
        for (let col = -100; col <= 100; col++) {
            arr[row][col] = { data: Math.random() * 100 < 27 ? 'bomb' : 0, checked: false }
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
