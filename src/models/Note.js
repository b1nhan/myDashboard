const db = require('../config/db');

class Note{
    static async getNote(){
        const result = await db.execute('SELECT * FROM tasks');
        return result;
    }

    static async setNote(userID, noteContent){ 
        const sql = `INSERT INTO note (user_id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = content`; 

        const [result] = await db.execute(sql, [userID, noteContent]); 

        return { 
            success: true, 
            message: 'Note updated successfully', 
            changes: result.affectedRows 
        }; 
    }
}

module.exports = Note;