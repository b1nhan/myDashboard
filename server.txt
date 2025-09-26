const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'username', // Replace with your MySQL username
    password: 'password', // Replace with your MySQL password
    database: 'dashboard_db'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// API routes
// Get note
app.get('/api/note', (req, res) => {
    const sql = 'SELECT * FROM note';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching note:', err);
            return res.status(500).send('Error fetching note');
        }
        res.json(results);
    });
});
//Set note
app.post('/api/note', (req, res) => {
    const { content } = req.body;

    const sql = `INSERT INTO note (id, content) VALUES (1, ?)
                ON DUPLICATE KEY UPDATE content = ?;`
    db.query(sql, [content, content], (err, results) => {
        if (err) {
            console.error('Error adding/updating note:', err);
            return res.status(500).send('Error adding/updating note');
        }
        res.status(200).json({ message: 'Note updated successfully', changes: results.affectedRows });
    });
});


// Get all tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Error fetching tasks');
        }
        res.json(results);
    });
});

// Add a new task
app.post('/api/tasks', (req, res) => {
    let { name, type, deadline } = req.body;
    if(deadline === '1111-11-11'){
        deadline=null;
    }
    let buttonChecked= deadline ? true :false;

    const sql = 'INSERT INTO tasks (name, type, deadline, buttonChecked) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, type, deadline, buttonChecked], (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).send('Error adding task');
        }
        res.status(201).json({ id: result.insertId, name, type, deadline, is_completed: false, buttonChecked});
    });
});

// Update a task (e.g., mark as completed)
app.put('/api/tasks/:id', (req, res) => {
    const { is_completed } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE tasks SET is_completed = ? WHERE id = ?';
    db.query(sql, [is_completed, id], (err) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task');
        }
        res.send('Task updated successfully.');
    });
});
app.put('/api/tasks/full/:id', (req, res) => {
    const { id } = req.params;
    let { name, type, deadline, is_completed,} = req.body;

    if (deadline === '1111-11-11') {
        deadline = null;
    }
    let buttonChecked= !!deadline;

    const sql = 'UPDATE tasks SET name = ?, type = ?, deadline = ?, is_completed = ?,buttonChecked =? WHERE id = ?';
    db.query(sql, [name, type, deadline, is_completed, buttonChecked, id], (err) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task');
        }
        res.send('Task updated successfully.');
    });
});


// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).send('Error deleting task');
        }
        res.send('Task deleted successfully.');
    });
});

// Serve index.html for all unmatched routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
