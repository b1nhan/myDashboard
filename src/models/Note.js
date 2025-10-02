const db = require('../config/db');

class Note{
    static async getNote(userID){
        const [result] = await db.execute('SELECT * FROM note WHERE user_id = ?',[userID]);
        return result;
    }

    static async setNote(userID, noteContent){ 
        const sql = `INSERT INTO mydashboard_db.note (user_id, content) VALUES (?, ?) AS new_values ON DUPLICATE KEY UPDATE content = new_values.content;  `; 

        const [result] = await db.execute(sql, [userID, noteContent]); 

        return { 
            success: true, 
            message: 'Note updated successfully', 
            changes: result.affectedRows 
        }; 
    }
}

module.exports = Note;