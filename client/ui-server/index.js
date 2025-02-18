// filepath: /c:/Users/Stacks/Documents/Learning Journey/Angular Projects/jerry-the-crypto-trading-predictor/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Use Helmet to set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/jerry-ui/browser')));

// Handle all other routes with the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/jerry-ui/browser/index.html'));
});

// Start the server with HTTPS
const PORT = process.env.PORT || 8080;
const options = {
  key: fs.readFileSync('ssl/private.key'),
  cert: fs.readFileSync('ssl/certificate.crt'),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});