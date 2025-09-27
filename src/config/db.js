const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,   // max connections
    queueLimit: 0          // unlimited queued requests
});


(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to MySQL database.');
        connection.release(); // trả connection lại cho pool
    } catch (err) {
        console.error('Error connecting to MySQL:', err.message);
    }
})();

module.exports = db; // Sử dụng promise để dễ dàng dùng async/await