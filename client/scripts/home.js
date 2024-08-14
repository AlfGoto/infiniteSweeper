import { creAppend } from "./utils.js"


export default class home{
    constructor(){
        this.main = document.createElement('main')
        document.body.appendChild(this.main)
        this.createNav()
        this.page = ''
    }
    createNav(){
        this.nav = creAppend(document.body, 'nav')
        let pages = [creAppend(this.nav, 'p', 'Game'), creAppend(this.nav, 'p', 'Classement'), creAppend(this.nav, 'p', 'Skins'), creAppend(this.nav, 'p', 'Profile')]
        pages.forEach(e=>{e.onclick = ()=>{this.openPage(e.innerHTML)}})
    }
    openPage(page){
        if(this.page === page)return
        this.page = page
        console.log(page)
    }
}

