import basicGames from './basic.js'
import { creAppend } from './utils.js'

export default class home {
    constructor() {
        this.main = document.getElementsByTagName('main')[0]
        this.createNav()
    }
    createNav() {
        this.nav = document.getElementsByTagName('nav')[0]

        this.navClassement = this.nav.children[0]
        this.navGame = this.nav.children[1]
        this.navSkins = this.nav.children[2]
        this.navProfile = this.nav.children[3]

        this.navClassement.onclick = (e) => { this.changePage('-300svw', e.target) }
        this.navGame.onclick = (e) => { this.changePage('-200svw', e.target) }
        this.navSkins.onclick = (e) => { this.changePage('-100svw', e.target) }
        this.navProfile.onclick = (e) => { this.changePage('0svw', e.target) }
        this.changePage('-200svw', this.navGame)
    }
    changePage(decal, target) {
        document.getElementsByClassName('selected')[0].classList.remove('selected')
        Array.from(document.getElementsByClassName('beforeSelected')).forEach(e=>{e.classList.remove('beforeSelected')})
        Array.from(document.getElementsByClassName('afterSelected')).forEach(e=>{e.classList.remove('afterSelected')})
        let passed = false
        Array.from(this.nav.children).forEach(e => {
            if (e == target) {
                target.classList.add('selected')
                passed = true
            }else {
                if (!passed) e.classList.add('beforeSelected')
                else e.classList.add('afterSelected')
            }
        })
        // target.classList.add('selected')
        this.main.style.left = decal

        this.gamePage()
    }
    gamePage(){
        this.gameSoloButton = document.getElementById('gameSoloButton')
        this.gameSoloButton.onclick = ()=>{this.startGameSolo()}
        
        this.gameMultButton = document.getElementById('gameMultButton')
        this.gameMultButton.onclick = ()=>{this.startGameMult()}
    }
    startGameSolo(){
        this.display(false)
        this.game = new basicGames()
    }
    startGameMult(){
        alert('Multiplayer is not implemented yet, coming soon !')
    }

    display(arg){
        if(arg){
            this.main.style.display = 'flex'
            this.nav.style.display = 'flex'
        }else{
            this.main.style.display = 'none'
            this.nav.style.display = 'none'
        }
    }
}

