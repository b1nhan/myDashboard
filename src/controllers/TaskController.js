const { raw } = require('mysql2');
const Task = require('../models/Task');

class TaskController{

    static async getAllTasks(req, res){
        try {
            const userID = req.user.id;
            const type = req._parsedOriginalUrl.query;
            if(type){
                const tasks = await Task.getAllTasks(userID, type);
                res.json(tasks);
            }
            else{
                const tasks = await Task.getAllTasks(userID);
                res.json(tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).send('Error fetching tasks');
        }
    };
    
    static async addNewTask(req, res){
        try{
            const userID = req.user.id;
            const body = req.body;
            if('name' in body && 'type' in body && 'deadline' in body){
                let { name, type, deadline } = req.body;
                if(deadline === '1111-11-11'){
                    deadline=null;
                }
                const buttonChecked= deadline ? true :false; 
    
                const taskData={
                    name,
                    type,
                    deadline,
                    buttonChecked
                };
                const newTask = await Task.addNewTask(userID, taskData);
                res.status(201).json(newTask);

            }
            else if ('rawText' in body && 'type' in body){
                const regex = /^\s*(\[[x ]?\])\s+([^(]+?)(?:\s+\((\d{1,2}\/\d{1,2}\/\d{2})\))?$/gm;
                
                const { rawText, type} = req.body;
                await Task.deleteAllTasks(type, userID);
                // if(!rawText) return;
                let listNewTask =[];
                for (const match of rawText.matchAll(regex)) {
                    const status = match[1];
                    const name = match[2].trim();
                    let deadline = match[3] || null;
                    // format deadline
                    if (deadline){
                        const parts = deadline.split('/');
                        if (parts.length !== 3) return null; // Kiểm tra định dạng hợp lệ
                        const [day, month, year] = parts;
                        // 20xx
                        const fullYear = '20' + year; 
                        //YYYY-MM-DD
                        deadline = `${fullYear}-${month}-${day}`;
                    }
                    const buttonChecked= deadline ? true :false; 
                    const is_completed = status === '[x]';
                    
                    const taskData={
                        name,
                        type,
                        deadline,
                        buttonChecked,
                        is_completed
                    };
                    const newTask = await Task.addNewTask(userID, taskData);
                    listNewTask.push(newTask);
                }
                res.status(201).json(listNewTask);
            }

        }
        catch(error){
            console.error(req.body,req.user.id,'Error adding task:', error);
            return res.status(500).send('Error adding task');
        }
    };

    static async updateTaskOrder(req, res){
        try{
            const tasksIDList = req.body.tasksIDList;
            const userID = req.user.id;

            await Task.updateTaskOrder(userID, tasksIDList);

            res.json({
                message: 'Update task order successfully'
            })
        }
        catch (err){
            console.error(req.body.tasksIDList, 'Error updating task order:', err);
            return res.status(500).send('Error updating task order');
        }

    }

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