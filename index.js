const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cors = require('cors');

const bodyParser = require('body-parser');
// Middleware
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());
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


const marksSchema = new mongoose.Schema({
  rollNo: String,
  studentName: String,
  internal1: Number,
  quiz1: Number,
  assignment1: Number,
  internal2: Number,
  quiz2: Number,
  assignment2: Number,
  model: Number,
  quiz3: Number,
});

const extmarksSchema=new mongoose.Schema({
  rollNo:String,
  studentName:String,
  externalMark:Number,
});

const ExtMarks =mongoose.model('External',extmarksSchema)
const Marks = mongoose.model('Marks', marksSchema);


//Two tables are created
const studentdetails = mongoose.model('studentdetails', studetails);




app.post('/savemarks', async (req, res) => {
  const marks = req.body;
  try {
    console.log(marks)
    const newMarks = new Marks(marks);
    await newMarks.save();
    res.status(200).json({ message: 'Marks saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving marks', error });
  }
});





// Routes
app.post('/addExternalMarks', async (req, res) => {
  const { rollNo, studentName, externalMark } = req.body;

  if (!rollNo || !studentName || externalMark === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (externalMark < 0 || externalMark > 60) {
    return res.status(400).json({ error: 'Marks must be between 0 and 60' });
  }

  try {
    const newMarks = new ExtMarks({ rollNo, studentName, marks });
    await newMarks.save();
    res.status(201).json({ message: 'Marks saved successfully' });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ error: 'Failed to save marks' });
  }
});

app.get('/externalMarks', async (req, res) => {
  try {
    const marks = await ExtMarks.find();
    res.status(200).json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});




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



