const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Example route to log data
app.post('/log', (req, res) => {
    console.log('Received data:', req.body);
    res.json({ message: 'Data received successfully!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

