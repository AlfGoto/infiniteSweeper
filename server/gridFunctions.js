export function createGrid() {
    let arr = []
    let start = Date.now()

    for (let row = -100; row <= 100; row++) {
        arr[row] = []
        for (let col = -100; col <= 100; col++) {
            // console.log(col)
            if (Math.random() * 100 < 25) {
                arr[row][col] = { data: 'bomb', checked: false }
            } else {
                arr[row][col] = { data: 0, checked: false }
            }
        }
    }
    arr.forEach((r, row) => {
        r.forEach((e, col) => {
            if (e.data === 'bomb') { for (let r = row - 1; r <= row + 1; r++) { if (arr[r]) { for (let c = col - 1; c <= col + 1; c++) { addData(arr, r, c) } } } }
        })
    })
    console.log('time to build the grid:', Date.now() - start, 'ms')

    return arr
}
function addData(arr, row, col) { if (existNotBoumb(arr, row, col)) arr[row][col].data++ }
function existNotBoumb(arr, row, col) { return arr[row][col] && arr[row][col].data !== 'bomb' }