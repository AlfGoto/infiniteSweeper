import { creAppend } from "./utils.js"

export default class inGameMenu{
    constructor(){
        this.div = creAppend(document.body, 'div')
        this.div.id = 'inGameMenu'
        this.nbCases = 0
        this.time = 0

        this.dom = {
            check: creAppend(this.div, 'input'),
            label: creAppend(this.div, 'label'),
            stats: creAppend(this.div, 'div')
        }
        this.dom.timeDiv = creAppend(this.dom.stats, 'div')
        this.dom.nbCasesDiv = creAppend(this.dom.stats, 'div')
        this.dom.timeLabel = creAppend(this.dom.timeDiv, 'p')
        this.dom.timeLabel.classList.add('label')
        this.dom.nbCasesLabel = creAppend(this.dom.nbCasesDiv, 'p')
        this.dom.nbCasesLabel.classList.add('label')
        this.dom.timeDiv = creAppend(this.dom.timeDiv, 'p')
        this.dom.nbCasesDiv = creAppend(this.dom.nbCasesDiv, 'p')

        this.dom.check.id = 'menuCheckbox'
        this.dom.check.setAttribute("type", "checkbox");
        this.dom.label.setAttribute('for', 'menuCheckbox')
    }
    replay(){
        console.log('PREREPLAY')
    }
    start(){
        this.time = Date.now()
    }
    remove(){
        this.div.remove()
    }
}