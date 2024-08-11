export function createGrid() {
    let arr = []
    let start = Date.now()

    for (let row = -100; row <= 100; row++) {
        arr[row] = []
        for (let col = -100; col <= 100; col++) {
            // console.log(col)
            if (Math.random() * 100 < 6) {
                arr[row][col] = {data: 'bomb', checked: false}
            }else{
                arr[row][col] = {data: 0, checked: false}
            }
        }
    }
    arr.forEach((r, row)=>{
        r.forEach((e, col)=>{
            if(e.data === 'bomb'){
                if(arr[row-1]){
                    if(arr[row-1][col-1])arr[row-1][col-1].data++
                    if(arr[row-1][col])arr[row-1][col].data++
                    if(arr[row-1][col+1])arr[row-1][col+1].data++
                }
                if(arr[row]){
                    if(arr[row][col-1])arr[row][col-1].data++
                    if(arr[row][col+1])arr[row][col+1].data++
                }
                if(arr[row+1]){
                    if(arr[row+1][col-1])arr[row+1][col-1].data++
                    if(arr[row+1][col])arr[row+1][col].data++
                    if(arr[row+1][col+1])arr[row+1][col+1].data++
                }
            }
        })
    })
    console.log('time to build the grid:', Date.now() - start, 'ms')

    return arr
}