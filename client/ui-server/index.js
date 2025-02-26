// filepath: /c:/Users/Stacks/Documents/Learning Journey/Angular Projects/jerry-the-crypto-trading-predictor/server.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/jerry-ui/browser')));

// Handle all other routes with the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/jerry-ui/browser/index.html'));
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});