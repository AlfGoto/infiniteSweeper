import basicGames from './basic.js'
import user from './user.js'
import socket from './socket.js'

export default class home {
    constructor() {
        this.main = document.getElementsByTagName('main')[0]
        this.createNav()
        this.socketResponse()
        let cookieUser = (document.cookie.match(/^(?:.*;)?\s*user\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]
        if (cookieUser) { socket.emit('TokenConnect', cookieUser) }
    }
    socketResponse() {
        socket.on('logError', data => { document.getElementById('logError').innerHTML = data })
        socket.on('logSuccess', data => {
            console.log('logSuccess', data)
            user.name = data.username
            if (data.token) document.cookie = "user=" + data.token + '; expires=Thu, 18 Dec 2150 12:00:00 UTC'
            this.connectUser()
        })
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
        Array.from(document.getElementsByClassName('beforeSelected')).forEach(e => { e.classList.remove('beforeSelected') })
        Array.from(document.getElementsByClassName('afterSelected')).forEach(e => { e.classList.remove('afterSelected') })
        let passed = false
        Array.from(this.nav.children).forEach(e => {
            if (e == target) {
                target.classList.add('selected')
                passed = true
            } else {
                if (!passed) e.classList.add('beforeSelected')
                else e.classList.add('afterSelected')
            }
        })
        // target.classList.add('selected')
        this.main.style.left = decal

        this.gamePage()
        this.profilePage()
    }
    profilePage() {
        if (user.name) {
            user.dom.form.div.style.display = 'none'
            user.dom.div.style.display = 'flex'
        } else {
            user.dom.div.style.display = 'none'
            user.dom.form.div.style.display = 'flex'
        }
        user.dom.form.login.onclick = () => { this.logreg('login') }
        user.dom.form.register.onclick = () => { this.logreg('register') }

        user.dom.unlogButton.onclick = ()=>{
            console.log('UNLOAD')
            document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            location.reload()
        }

    }
    logreg(arg) {
        let name = user.dom.form.name.value
        let password = user.dom.form.password.value
        if (name.length < 5 || name.length > 15) return
        if (password.length < 5 || password.length > 15) return

        socket.emit(arg, { username: name, password: password, remember: user.dom.form.remember.checked })
    }
    gamePage() {
        this.gameSoloButton = document.getElementById('gameSoloButton')
        this.gameSoloButton.onclick = () => { this.startGameSolo() }

        this.gameMultButton = document.getElementById('gameMultButton')
        this.gameMultButton.onclick = () => { this.startGameMult() }
    }
    startGameSolo() {
        this.display(false)
        this.game = new basicGames()
    }
    startGameMult() {
        alert('Multiplayer is not implemented yet, coming soon !')
    }
    connectUser() {
        user.dom.form.div.style.display = 'none'
        user.dom.div.style.display = 'flex'
        user.dom.userName.innerHTML = user.name
    }
    display(arg) {
        if (arg) {
            this.main.style.display = 'flex'
            this.nav.style.display = 'flex'
        } else {
            this.main.style.display = 'none'
            this.nav.style.display = 'none'
        }
    }
}

