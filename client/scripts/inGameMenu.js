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
                <div><p>Time</p><p id="menuTimer">0</p></div>
                <div><p>Cases</p><p id="menuCases">0</p></div>
                <button id="quitButton">Quit</button>`, this.div)
        this.dom.menuRestartButton.onclick = ()=>{this.restart()}
    }
    restart() {
        console.log('PREREPLAY')
    }
    start() {
        this.start = Date.now()
        this.time = 0
        this.interval = setInterval(()=>{this.setTime()}, 1000)
    }
    setTime(){
        this.time = Math.ceil((Date.now() - this.start) / 1000)
        console.log(this.dom)
        this.dom.menuTimer.innerHTML = this.time
    }
    stop(){clearInterval(this.interval)}
    remove() {
        this.div.remove()
    }
}