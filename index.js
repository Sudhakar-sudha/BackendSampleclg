const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// MongoDB Connection String
// const dburl = "mongodb+srv://sudhakar:sudhakar@cluster0.odnra2b.mongodb.net/clg?retryWrites=true&w=majority";
// const dburl = "mongodb://sudhakar:sudhakar@cluster0-shard-00-00.odnra2b.mongodb.net:27017,cluster0-shard-00-01.odnra2b.mongodb.net:27017,cluster0-shard-00-02.odnra2b.mongodb.net:27017/clg?ssl=true&replicaSet=atlas-pf9g4p-shard-0&authSource=admin&retryWrites=true&w=majority";
// const dburl = "mongodb+srv://sudhakar:sudhakar@cluster0.odnra2b.mongodb.net/clg?retryWrites=true&w=majority";
const dbUrl="mongodb+srv://sudhakar:sudhakar@cluster0.odnra1b.mongodb.net/";

// Start the server only after database connection
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
// Connect to MongoDB
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Route Handlers
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


