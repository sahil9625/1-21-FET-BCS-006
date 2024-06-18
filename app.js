const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;

// Configuration
const WINDOW_SIZE = 10;
const TIMEOUT = 500; // 500 milliseconds

// Storage for numbers
let window = [];

// Third-party server URLs
const SERVER_URLS = {
    'p': "http://20.244.56.144/test/primes",
    'f': "http://20.244.56.144/test/fibo",
    'e': "http://20.244.56.144/test/even",
    'r': "http://20.244.56.144/test/rand"
};

app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;

    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    // Fetch numbers from the appropriate third-party server
    let numbers = [];
    let start_time = Date.now();
    try {
        const response = await axios.get(SERVER_URLS[numberId], { timeout: TIMEOUT });
        let response_time = Date.now() - start_time;
        if (response_time > TIMEOUT) {
            throw new Error('Timeout');
        }
        if (response.status !== 200) {
            throw new Error('Request failed');
        }
        numbers = response.data.numbers || [];
    } catch (error) {
        numbers = [];
    }

    // Remove duplicates and maintain unique numbers
    const newNumbers = numbers.filter(num => !window.includes(num));

    // Update window
    const windowPrevState = [...window];
    window = [...window, ...newNumbers].slice(-WINDOW_SIZE);
    const windowCurrState = [...window];

    // Calculate average
    const avg = window.length > 0 ? (window.reduce((acc, num) => acc + num, 0) / window.length).toFixed(2) : 0;

    // Create response
    const response = {
        windowPrevState,
        windowCurrState,
        numbers,
        avg: parseFloat(avg)
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
