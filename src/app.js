const express = require('express');
const path = require('path');
require('dotenv').config(); // Load environment variables

const apiRoutes = require('./routes/api');
const apiRoutesAuth = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);
app.use('/api', apiRoutesAuth);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});