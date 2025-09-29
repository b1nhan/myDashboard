const db = require('../config/db');

class Task{
    static async getAllTasks(userID) {
        const [rows] = await db.execute('SELECT * FROM tasks WHERE user_id = ? order by deadline is null, deadline asc', [userID]);
        return rows;
    }

    static async addNewTask(userID, taskData){
        const {name, type, deadline, buttonChecked} = taskData;

        const sql = 'INSERT INTO tasks (user_id, name, type, deadline, buttonChecked) VALUE (?,?,?,?,?)';

        const [result] = await db.execute(sql, [userID, name, type, deadline, buttonChecked]);

        return {
            id: result.insertId,
            user_id:userID,
            name,
            type,
            deadline,
            is_completed: false,
            buttonChecked
        }
    }

    static async updateTask(userID, id, is_completed){

        const sql ='UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?';
        const result = await db.execute(sql, [is_completed, id, userID]);

        if (result.affectedRows === 0) {
            throw new Error('Task not found');
        }
        
        return { message: 'Task status updated successfully' };

    }

    static async updateTaskFull(userID, id, taskData){
        const {name, type, deadline, buttonChecked} = taskData;

        const sql=' UPDATE tasks SET name = ?, type = ?, deadline = ?, buttonChecked = ? WHERE id = ? AND user_id = ?';
        const result = await db.execute(sql, [name, type, deadline, buttonChecked, id, userID]);

        if (result.affectedRows === 0) {
            throw new Error('Task not found');
        }

        return { message: 'Task full updated successfully' };
    }

    static async deleteTask(userID, id){
        await db.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userID]);
        return {message: 'Delete task successfully'};
    }

    static async getByUserId(userId) {
        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE user_id = ?',
            [userId]
        );
        return rows;
    }
    
}


module.exports = Task;