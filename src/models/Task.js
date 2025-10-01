const db = require('../config/db');

class Task{
    static async getAllTasks(userID,type) {
        if(type){
            const [rows] = await db.execute('SELECT * FROM tasks WHERE user_id = ? AND type = ? order by deadline is null, deadline asc, order_index asc', [userID, type]);
            return rows;
        }
        else{
            const [rows] = await db.execute('SELECT * FROM tasks WHERE user_id = ? order by deadline is null, deadline asc, order_index asc', [userID]);
            return rows;
        }
    }
    static async deleteAllTasks(type, userID) {
        await db.execute('DELETE FROM tasks WHERE type = ? AND user_id = ?', [type, userID]);
    }

    static async addNewTask(userID, taskData){
        if ('is_completed' in taskData){
            const {name, type, deadline, buttonChecked, is_completed} = taskData;
    
            const sql = 'INSERT INTO tasks (user_id, name, type, deadline, buttonChecked, is_completed) VALUE (?,?,?,?,?,?)';
    
            const [result] = await db.execute(sql, [userID, name, type, deadline, buttonChecked, is_completed]);
            
            return {
                id: result.insertId,
                user_id:userID,
                name,
                type,
                deadline,
                is_completed: true,
                buttonChecked
            }
        }
        else{
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

    }

    static async updateTaskOrder(userID, tasksIDList) {

        const results = await Promise.all(tasksIDList.map((taskId, index) => {
            return db.query(
                'UPDATE tasks SET order_index = ? WHERE id = ? AND user_id = ?',
                [index, taskId, userID]
            );
        }));

        // Kiểm tra xem có task nào không được update
        const notUpdated = results.filter(r => r[0].affectedRows === 0);
        if (notUpdated.length > 0) {
            throw new Error('Some tasks not found or not updated');
        }

        return { message: 'Task order updated successfully' };
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