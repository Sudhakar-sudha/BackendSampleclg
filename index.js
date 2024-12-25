// const express = require('express');
// const app = express();
// const port = 3000;
// const mongoose = require('mongoose');
// const cors = require('cors');

// const bodyParser = require('body-parser');
// // Middleware
// app.use(cors());
// app.use(express.json());

// app.use(bodyParser.json());
// // Connect to MongoDB Atlas
// const dbUrl="mongodb+srv://sudhakar:sudhakar@cluster0.odnra1b.mongodb.net/clg?retryWrites=true&w=majority&appName=Cluster0"
// mongoose.connect(dbUrl).then((con) => {
//   console.log('MongoDB connected to host ' + con.connection.host);
// }).catch((err) => {
//   console.error('Database connection error:', err);
//   process.exit(1); // Exit process with failure
// });

// // Schema and Model
// const studetails = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
// });


// const marksSchema = new mongoose.Schema({
//   rollNo: String,
//   studentName: String,
//   internal1: Number,
//   quiz1: Number,
//   assignment1: Number,
//   internal2: Number,
//   quiz2: Number,
//   assignment2: Number,
//   model: Number,
//   quiz3: Number,
// });

// const extMarksSchema = new mongoose.Schema({
//   rollNo: { type: String, required: true },
//   studentName: { type: String, required: true },
//   externalMarks: { type: Number, required: true, min: 0, max: 60 },
// });


// const ExtMarks = mongoose.model('ExtMarks', extMarksSchema);
// const Marks = mongoose.model('Marks', marksSchema);


// //Two tables are created
// const studentdetails = mongoose.model('studentdetails', studetails);




// app.post('/savemarks', async (req, res) => {
//   const marks = req.body;
//   try {
//     console.log(marks)
//     const newMarks = new Marks(marks);
//     await newMarks.save();
//     res.status(200).json({ message: 'Marks saved successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving marks', error });
//   }
// });




// app.post('/addExternalMark', async (req, res) => {
//   const { rollNo, studentName, externalMarks } = req.body; // Updated to use `externalMarks`

//   // Validate required fields
//   if (!rollNo || !studentName || externalMarks === undefined) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   // Validate marks range
//   if (externalMarks < 0 || externalMarks > 60) {
//     return res.status(400).json({ error: 'Marks must be between 0 and 60' });
//   }

//   try {
//     // Corrected object to include proper field names
//     const newMarks = new ExtMarks({ 
//       rollNo, 
//       studentName, 
//       externalMarks // Use the correct field name
//     });

//     // Save to the database
//     await newMarks.save();

//     // Send success response
//     res.status(201).json({ message: 'Marks saved successfully', newMarks });
//   } catch (error) {
//     console.error('Error saving marks:', error);

//     // Send error response
//     res.status(500).json({ error: 'Failed to save marks' });
//   }
// });

// app.get('/addExternalMark', async (req, res) => {
//   try {
//     const marks = await ExtMarks.find();
//     res.status(200).json(marks);
//   } catch (error) {
//     console.error('Error fetching marks:', error);
//     res.status(500).json({ error: 'Failed to fetch marks' });
//   }
// });




// //the admin has added a employee 
// app.post('/studentdetails', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).send('Username and password are required');
//   }
//   try {
//     // Check if the user already exists
//     const existingUser = await studentdetails.findOne({ username });
//     if (existingUser) {
//       return res.status(409).send('User already exists');
//     }
//     // Create a new user if not exists
//     const newUser = new studentdetails({ username, password });
//     await newUser.save();
//     res.status(201).send('User added successfully');
//   } catch (error) {
//     console.error('Error adding user:', error);
//     res.status(500).send('Error adding user');
//   }
// });




// app.get('/studentdetails', async (req, res) => {
//   try {
//       const users = await studentdetails.find();
//       res.json(users);
//       console.log(users);
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Server Error');
//   }
// });






// //Edit the employee Details
// //update employee 

// app.put('/studentdetails/:id', async (req, res) => { 
//   try {
//       const {username , password }= req.body;
//       const id=req.params.id;
//       const updateDetails = await studentdetails.findByIdAndUpdate(
//         id,
//         {username,password}
//       )      
//       if (!updateDetails){
//         return res.status(404).json({message:"Details not found"})
//       }
//       res.json(updateDetails)
     
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Server Error');
//   }
// });

// //the admin only delete the  employee login details so the employee cannot be login

// app.delete('/studentdetails/:id', async (req, res) => { 
//   try {
//       const id=req.params.id;
//       await studentdetails.findByIdAndDelete(id);
//       res.status(204).end();
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Server Error');
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });





const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const dbUrl = "mongodb+srv://sudhakar:sudhakar@cluster0.odnra1b.mongodb.net/clg?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbUrl)
  .then((con) => {
    console.log('MongoDB connected to host ' + con.connection.host);
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Schema and Models
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

const extMarksSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  studentName: { type: String, required: true },
  externalMarks: { type: Number, required: true, min: 0, max: 60 },
});

// Models
const ExtMarks = mongoose.model('ExtMarks', extMarksSchema);
const IntMarks = mongoose.model('IntMarks', marksSchema);
const studentdetails = mongoose.model('studentdetails', studetails);

// Routes

// Save internal marks
app.post('/savemarks', async (req, res) => {
  const marks = req.body;
  try {
    const newMarks = new IntMarks(marks);
    await newMarks.save();
    res.status(200).json({ message: 'Marks saved successfully!' });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ message: 'Error saving marks', error });
  }
});



// app.get('/savemarks', async (req, res) => {
//   try {
//     const marks = await IntMarks.find(); // Fetch all marks from the database
//     res.status(200).json(marks); // Send back the marks in JSON format
//   } catch (error) {
//     console.error('Error fetching internal marks:', error);
//     res.status(500).json({ message: 'Error fetching internal marks' });
//   }
// });



app.get('/savemarks', async (req, res) => {
  try {
    const students = await IntMarks.find(); // Fetch all marks from the database

    const calculateInternalMarks = (marks) => {
      // Validate and provide default values if data is missing
      const internal1 = parseFloat(marks.internal1) || 0;
      const internal2 = parseFloat(marks.internal2) || 0;
      const modelMarks = parseFloat(marks.modelMarks) || 0;
      const quiz1 = parseFloat(marks.quiz1) || 0;
      const quiz2 = parseFloat(marks.quiz2) || 0;
      const quiz3 = parseFloat(marks.quiz3) || 0;
      const assignment1 = parseFloat(marks.assignment1) || 0;
      const assignment2 = parseFloat(marks.assignment2) || 0;

      // Step 1: Convert model mark to 25
      const modelTo25 = (modelMarks / 100) * 25;

      // Step 2: Take the highest of internal1, internal2, and modelTo25, then divide by 2
      const internals = [internal1, internal2, modelTo25].sort((a, b) => b - a);
      const highestInternal = (internals[0] + internals[1]) / 2;
      console.log(
        `Highest two internals for rollNo ${marks.rollNo}: (${internals[0]} + ${internals[1]}) / 2 = ${highestInternal}`
      );

      // Step 3: Take the highest two quiz marks out of quiz1, quiz2, and quiz3, then divide by 4
      const quizMarks = [quiz1, quiz2, quiz3].sort((a, b) => b - a);
      const highestQuiz = (quizMarks[0] + quizMarks[1]) / 4;
      console.log(`Highest quizzes for rollNo ${marks.rollNo}: (${quizMarks[0]} + ${quizMarks[1]}) / 4 = ${highestQuiz}`);

      // Step 4: Take two assignment marks, then divide by 2
      const assignmentMarks = (assignment1 + assignment2) / 2;
      console.log(`Assignment marks for rollNo ${marks.rollNo}: (${assignment1} + ${assignment2}) / 2 = ${assignmentMarks}`);

      // Step 5: Add the results of the three calculations
      return highestInternal + highestQuiz + assignmentMarks;
    };

    const results = students.map((student) => {
      const calculatedMarks = calculateInternalMarks(student);
      return {
        studentId: student.rollNo,
        studentName: student.studentName,
        calculatedMarks: calculatedMarks.toFixed(2), // Limit to 2 decimal places
      };
    });

    res.status(200).json(results); // Send calculated marks in response
    
  } catch (error) {
    console.error('Error fetching or calculating marks:', error);
    res.status(500).json({ message: 'Error fetching internal marks' });
  }
});





// Save external marks
app.post('/addExternalMark', async (req, res) => {
  const { rollNo, studentName, externalMarks } = req.body;

  // Validate required fields
  if (!rollNo || !studentName || externalMarks === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate marks range
  if (externalMarks < 0 || externalMarks > 60) {
    return res.status(400).json({ error: 'Marks must be between 0 and 60' });
  }

  try {
    const newMarks = new ExtMarks({ 
      rollNo, 
      studentName, 
      externalMarks
    });

    // Save to the database
    await newMarks.save();

    res.status(201).json({ message: 'Marks saved successfully', newMarks });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ error: 'Failed to save marks' });
  }
});

// Get external marks for all students
app.get('/addExternalMark', async (req, res) => {
  try {
    const marks = await ExtMarks.find();
    res.status(200).json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// Add student details
app.post('/studentdetails', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  try {
    const existingUser = await studentdetails.findOne({ username });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const newUser = new studentdetails({ username, password });
    await newUser.save();
    res.status(201).send('User added successfully');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Error adding user');
  }
});

// Get all student details
app.get('/studentdetails', async (req, res) => {
  try {
    const users = await studentdetails.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server Error');
  }
});

// Edit student details
app.put('/studentdetails/:id', async (req, res) => {
  try {
    const { username, password } = req.body;
    const id = req.params.id;
    const updateDetails = await studentdetails.findByIdAndUpdate(
      id,
      { username, password },
      { new: true }
    );

    if (!updateDetails) {
      return res.status(404).json({ message: "Details not found" });
    }

    res.json(updateDetails);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Server Error');
  }
});

// Delete student details
app.delete('/studentdetails/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await studentdetails.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
