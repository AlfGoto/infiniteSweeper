export default class home{
    constructor(){
        this.main = document.getElementsByTagName('main')[0]
        this.createNav()
    }
    createNav(){
        this.nav = document.getElementsByTagName('nav')[0]

        this.navClassement = this.nav.children[0]
        this.navGame = this.nav.children[1]
        this.navSkins = this.nav.children[2]
        this.navProfile = this.nav.children[3]

        this.navClassement.onclick = ()=>{this.main.style.left = '0svw'}
        this.navGame.onclick = ()=>{this.main.style.left = '-100svw'}
        this.navSkins.onclick = ()=>{this.main.style.left = '-200svw'}
        this.navProfile.onclick = ()=>{this.main.style.left = '-300svw'}
    }
}

