require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload'); // Only if you need file uploads, otherwise remove
const path = require('path');

// Middleware to handle file uploads (if needed)
app.use(fileUpload({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

const port = process.env.PORT || 3000; // Use port from .env or default to 3000

// Basic route to serve index.html directly from public folder
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// You can add your API routes here if your backend needs to interact with the contract
// For a pure frontend dApp, this index.js primarily serves the static files.
// Example: (from our previous voting app backend)
// app.post("/vote", async (req, res) => {
//     // ... your backend logic here if you need server-side transactions
// });


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});