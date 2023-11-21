require('dotenv').config(); // Load environment variables from .env fil
const express = require('express');
const app = express();
const https = require('https');
const path = require('path');
const cors = require('cors'); // Require the cors middleware

// Enable CORS for all routes
const corsOptions = {
  origin: 'http://localhost:3000/', // Replace with the allowed origin
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define an endpoint on your Express app to handle the Square API request
app.get('/fetch-square-data', (req, res) => {
  const squareApiToken = process.env.SQUARE_API_TOKEN;

  if (!squareApiToken) {
    console.error('Error: Square API token not found.');
    return res.status(500).json({ error: 'Square API token not found.' });
  }

  const options = {
    hostname: 'connect.squareupsandbox.com',
    path: '/v2/catalog/list',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${squareApiToken}`,
      'Square-Version': '2023-10-18',
      'Content-Type': 'application/json',
      'Cookie': '__cf_bm=6fJs8Zl76Phcw6jNeFBPEr.l.W2k4_z6RibHhLEeX4-1699470994-0-AQOGMXnV1xVXkEdkGsowL6aS8VXvSxKdBL3QJAGsaPrpBqkhZeXjIIb12LXygeFOTh8agtyKP/mZdTSLi2Qs24w='
    }
  };

  let fetchedData = '';
  const reqToSquare = https.request(options, (response) => {
    response.on('data', (chunk) => {
      fetchedData += chunk;
    });

    response.on('end', () => {
      // Send the fetched data as a JSON response to the client
      res.json({ data: fetchedData });
    });
  });

  reqToSquare.on('error', (error) => {
    console.error('Error:', error);
    // Send an error response to the client if needed
    res.status(500).json({ error: 'Error fetching data from Square' });
  });

  reqToSquare.end();
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
