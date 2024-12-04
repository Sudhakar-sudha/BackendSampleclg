const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
