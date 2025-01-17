const express = require('express');
const loadFunction = require('./loadFunction').default;
const app = express();

app.get('/api/task', (req, res) => {
    console.log('Received request');
    const result = loadFunction();
    res.json({ result });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port, ${process.env.PORT}`);
});