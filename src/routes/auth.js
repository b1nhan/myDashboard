const express = require('express');
const router = express.Router();
const UserController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

// Giả sử dbConfig được truyền vào từ app chính
router.post('/register',UserController.register);
router.post('/login',UserController.login);
router.get('/users', authMiddleware, UserController.getUsername);

module.exports = router;