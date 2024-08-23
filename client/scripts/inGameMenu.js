import { domAlf, creAppend } from "../node_modules/domalf/index.js"

export default class inGameMenu {
    constructor() {
        this.nbCases = 0
        this.time = 0

        this.div = creAppend(document.body, 'div')
        this.div.id = "inGameMenu"

        this.dom = domAlf(`
                <input id="inGameMenuCheckbox" type="checkbox" />
                <label for="inGameMenuCheckbox"></label>
                <img id="menuRestartButton" src="img/logoRestart.png" alt="restart button">
                <div class="statsIndic"><p>Time</p><p id="menuTimer">0</p></div>
                <div class="statsIndic"><p>Cases</p><p id="menuCases">0</p></div>
                <button id="quitButton">Quit</button>`, this.div)
        this.dom.menuRestartButton.onclick = ()=>{this.restartClick()}
        this.dom.quitButton.onclick = ()=>{this.quit()}
    }
    restartClick(){
        // this.start()
        this.restart()
        this.nbCases = 0
    }
    restart() {console.log('REREPLAU')}
    start() {
        this.nbCases = 0
        this.startTime = Date.now()
        this.time = 0
        this.interval = setInterval(()=>{this.setTime()}, 1000)
    }
    setTime(){
        this.time = Math.ceil((Date.now() - this.startTime) / 1000)
        this.dom.menuTimer.innerHTML = this.time
    }
    addCase(add = 1){
        this.nbCases += add
        this.dom.menuCases.innerHTML = this.nbCases
    }
    quit(){ location.reload()}
    stop(){
        clearInterval(this.interval)
        this.startTime = undefined
    }
    remove() {
        this.div.remove()
    }
}