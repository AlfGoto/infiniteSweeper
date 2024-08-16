import con from './mysql.js'

export default class sql{
    constructor(){
        this.con = con
    }
}

class user{
    constructor(){
        this.con = con
    }
    login(){}
    register(){}
    search({}){}
}