import con from './mysql.js'
import secret from './secret.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
function sha256(message) {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return hash;
}
class sql {
    constructor() {
        this.user = new user()
        this.game = new game()
    }
}
class game {
    add(username, time, nbCases, flag) {
        con.query(`INSERT INTO game(username, time, cases, flagged) VALUES ('${username}',${time},${nbCases},${flag})`, function (err, result) { if (err) console.log(err) });
    }
}
class user {
    login(username, password, socket, remember) {
        password = sha256(password)
        con.query(`SELECT * FROM users WHERE username LIKE '${username}' AND password LIKE '${password}';`, function (err, result) {
            if (err) {
                socket.emit('logError', 'Log error, please contact an admin')
                return
            }
            result = JSON.parse(JSON.stringify(result))
            if (result.length !== 0) {
                socket.user = { id: result.insertId, username: username }
                if (remember) {
                    const token = jwt.sign({ username: username }, secret);
                    socket.emit('logSuccess', { username: username, token: token })
                }
                else socket.emit('logSuccess', { username: username })
            } else socket.emit('logError', 'Wrong username or password')
        });
    }
    register(username, password, socket, remember) {
        password = sha256(password)

        con.query(`SELECT * FROM users WHERE username LIKE '${username}';`, function (err, result) {
            if (err) {
                socket.emit('logError', 'Error, please contact an admin')
                return
            }
            result = JSON.parse(JSON.stringify(result))
            if (result.length === 0) {
                con.query(`INSERT INTO users(username, password) VALUES ('${username}', '${password}')`, function (err, result) {
                    if (err) {
                        socket.emit('logError', 'Registration Error, please contact an admin')
                        return
                    }
                    socket.user = { id: result.insertId, username: username }
                    if (remember) {
                        const token = jwt.sign({ username: username }, secret);
                        socket.emit('logSuccess', { username: username, token: token })
                    }
                    else socket.emit('logSuccess', { username: username })
                });
            } else socket.emit('logError', 'Username already taken')
        });
    }
    unlockJWT(token, socket) {
        jwt.verify(token, secret, (err, payload) => {
            if (err) {} 
            else {
                con.query(`SELECT * FROM users WHERE username LIKE '${payload.username}';`, function (err, result) {
                    if (err) {
                        socket.emit('logError', 'Error, please contact an admin')
                        return
                    }
                    socket.user = { id: result[0].id, username: result[0].username };
                    socket.emit('logSuccess', { username: result[0].username })
                });
            }
        });
    }
}
export default new sql()