const express = require('express');
const cors = require('cors'); // CORS 미들웨어 추가
const app = express();
const { Client } = require('pg');

app.use(cors()); // 모든 요청에 대해 CORS 허용

const client = new Client({
    user: process.env.POSTGRES_USER_ID,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.POSTGRES_USER_PASSWORD,
    port: 5432,
});
client.connect();

// Define route to handle /players endpoint
app.get('/player', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM player');
        const players = result.rows;
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});