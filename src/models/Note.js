const db = require('../config/db');

class Note{
    static async getNote(userID){
        const [result] = await db.execute('SELECT * FROM note WHERE user_id = ?',[userID]);
        return result;
    }

    static async setNote(userID, noteContent){ 
        const sql = `INSERT INTO note (user_id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)`; 

        const [result] = await db.execute(sql, [userID, noteContent]); 

        return { 
            success: true, 
            message: 'Note updated successfully', 
            changes: result.affectedRows 
        }; 
    }
}

module.exports = Note;