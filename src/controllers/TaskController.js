const Task = require('../models/Task');

class TaskController{

    static async getAllTasks(req, res){
        try {
            const userID = req.user.id;
            const tasks = await Task.getAllTasks(userID);
            res.json(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).send('Error fetching tasks');
        }
    };
    
    static async addNewTask(req, res){
        try{
            const userID = req.user.id;
            let { name, type, deadline } = req.body;
            if(deadline === '1111-11-11'){
                deadline=null;
            }
            let buttonChecked= deadline ? true :false; 

            const taskData={
                name,
                type,
                deadline,
                buttonChecked
            };

            const newTask = await Task.addNewTask(userID, taskData);

            res.status(201).json(newTask);
        }
        catch(error){
            console.error('Error adding task:', error);
            return res.status(500).send('Error adding task');
        }
    };

    static async updateTask(req, res){
        try{
            const userID = req.user.id;
            const { is_completed } = req.body;
            const { id } = req.params;

            await Task.updateTask(userID, id, is_completed);

            res.json({ 
                id,
                is_completed 
            });
        }
        catch (err){
            console.error('Error updating task status:', err);
            return res.status(500).send('Error updating task');
        }
    }
    static async updateTaskFull(req, res){
        try{
            const userID = req.user.id;
            const { id } = req.params;
            let { name, type, deadline, is_completed,} = req.body; 

            if (deadline === '1111-11-11') {
                deadline = null;
            }
            let buttonChecked= !!deadline;

            const taskData = {
                name,
                type,
                deadline,
                buttonChecked
            };

            await Task.updateTaskFull(userID, id, taskData);

            res.json({
                message: 'Task updated successfully',
                // task: updatedTask
            });
        }
        catch (err){
            console.error('Error updating task F:', err);
            return res.status(500).send('Error updating task');
        }
    }
    
    static async deleteTask(req, res){
        try{
            const userID = req.user.id;
            const { id } = req.params;
            await Task.deleteTask(userID, id);
            res.json({
                message : 'Task deleted successfully.'
            });
        }
        catch(err) {
            console.error('Error deleting task:', err);
            return res.status(500).send('Error deleting task');
        }
    }

    static async getTasks(req, res) {
        try {
            const rows = await Task.getByUserId(req.user.id);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server.' });
        }
    }
}

module.exports = TaskController;