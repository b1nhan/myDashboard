const jwt = require('jsonwebtoken');

const JWT_SECRET =process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Không có token được cung cấp.' });
    }
    const token = authHeader.split(' ')[1]; // Format: Bearer TOKEN

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Gắn thông tin người dùng vào request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};

module.exports = authMiddleware;