const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cors = require('cors');
// Middleware
app.use(cors());
app.use(express.json());
// Connect to MongoDB Atlas
const dbUrl="mongodb+srv://sudhakar:sudhakar@cluster0.odnra1b.mongodb.net/clg?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(dbUrl).then((con) => {
  console.log('MongoDB connected to host ' + con.connection.host);
}).catch((err) => {
  console.error('Database connection error:', err);
  process.exit(1); // Exit process with failure
});

// Schema and Model
const studetails = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});


//Two tables are created
const studentdetails = mongoose.model('studentdetails', studetails);


//the admin has added a employee 
app.post('/studentdetails', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  try {
    // Check if the user already exists
    const existingUser = await studentdetails.findOne({ username });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }
    // Create a new user if not exists
    const newUser = new studentdetails({ username, password });
    await newUser.save();
    res.status(201).send('User added successfully');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Error adding user');
  }
});




app.get('/studentdetails', async (req, res) => {
  try {
      const users = await studentdetails.find();
      res.json(users);
      console.log(users);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});






//Edit the employee Details
//update employee 

app.put('/studentdetails/:id', async (req, res) => { 
  try {
      const {username , password }= req.body;
      const id=req.params.id;
      const updateDetails = await studentdetails.findByIdAndUpdate(
        id,
        {username,password}
      )      
      if (!updateDetails){
        return res.status(404).json({message:"Details not found"})
      }
      res.json(updateDetails)
     
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

//the admin only delete the  employee login details so the employee cannot be login

app.delete('/studentdetails/:id', async (req, res) => { 
  try {
      const id=req.params.id;
      await studentdetails.findByIdAndDelete(id);
      res.status(204).end();
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



