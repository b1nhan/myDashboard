const User = require ('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
    static async register(req, res) {
        const { username, password } = req.body;
        try {
            await User.create(username, password);
            res.status(201).json({ message: 'Đăng ký thành công!' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Tên người dùng đã tồn tại.' });
            }
            res.status(500).json({ message: 'Lỗi server.' });
        }
    }

    static async login(req, res) {
        const { username, password } = req.body;
        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Tên đăng nhập không đúng.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu không đúng.' });
            }
            // Tạo JWT
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' } // Token sẽ hết hạn sau 24 giờ
            );
            res.json({ token, message: 'Đăng nhập thành công!' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server.' });
        }
    }
}

module.exports = UserController;