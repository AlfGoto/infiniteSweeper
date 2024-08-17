import con from './mysql.js'
import crypto from 'crypto'
function sha256(message) {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return hash;
}
class sql {
    constructor() {
        this.user = new user()
    }
}

class user {
    login(username, password, socket) {
        password = sha256(password)
        con.query(`SELECT * FROM users WHERE username LIKE '${username}' AND password LIKE '${password}';`, function (err, result) {
            if (err) {
                socket.emit('logError', 'Log error, please contact an admin')
                return
            }
            result = JSON.parse(JSON.stringify(result))
            if (result.length !== 0) {
                socket.user = { id: result.insertId, username: username }
                socket.emit('logSuccess', username)
            }else socket.emit('logError', 'Wrong username or password')
        });
    }
    register(username, password, socket) {
        password = sha256(password)

        con.query(`SELECT * FROM users WHERE username LIKE '${username}';`, function (err, result) {
            if (err) {
                socket.emit('logError', 'Error, please contact an admin')
                return
            }
            result = JSON.parse(JSON.stringify(result))
            if (result.length === 0) {

                let request = `INSERT INTO users(username, password) VALUES ('${username}', '${password}')`
                con.query(request, function (err, result) {
                    if (err) {
                        socket.emit('logError', 'Registration Error, please contact an admin')
                        return
                    }
                    socket.user = { id: result.insertId, username: username }
                    socket.emit('logSuccess', username)
                    return
                });
            } else {
                socket.emit('logError', 'Username already taken')
                return
            }
        });
    }
}
export default new sql()