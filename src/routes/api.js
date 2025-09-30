const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const NoteController = require('../controllers/NoteController');
const authMiddleware = require('../middleware/auth');

// Dùng router để định nghĩa các endpoint
router.get('/tasks', authMiddleware, TaskController.getAllTasks);
router.get('/note', authMiddleware, NoteController.getNote);
router.post('/tasks', authMiddleware, TaskController.addNewTask);
router.post('/note', authMiddleware, NoteController.setNote);
router.post('/tasks/reorder', authMiddleware, TaskController.updateTaskOrder);
router.put('/tasks/:id', authMiddleware, TaskController.updateTask);
router.put('/tasks/full/:id', authMiddleware, TaskController.updateTaskFull);
router.delete('/tasks/:id', authMiddleware, TaskController.deleteTask);

module.exports = router;