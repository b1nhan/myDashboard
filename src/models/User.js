const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        return result;
    }

    static async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        const user = rows[0];
        return user;
    }

    static async getUsername(userID){
        const result = await db.execute('SELECT username FROM users WHERE user_id = ?',[userID]);
        return result;
        
    }
}

module.exports = User;