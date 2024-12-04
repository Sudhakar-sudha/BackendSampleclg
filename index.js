const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
