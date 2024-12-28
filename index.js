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






  // Subject Schema and Model
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});


// Schema and Models
const studetails = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});


const marksSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, trim: true },
  studentName: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true }, // Subject name
  code: { type: String, required: true, unique: true, trim: true }, // Subject code
  internal1: { type: Number, min: 0, max: 25, required: true },
  quiz1: { type: Number, min: 0, max: 10, required: true },
  assignment1: { type: Number, min: 0, max: 10, required: true },
  internal2: { type: Number, min: 0, max: 25, required: true },
  quiz2: { type: Number, min: 0, max: 10, required: true },
  assignment2: { type: Number, min: 0, max: 10, required: true },
  model: { type: Number, min: 0, max: 60, required: true },
  quiz3: { type: Number, min: 0, max: 10, required: true },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields


const extMarksSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  studentName: { type: String, required: true },
  name: { type: String, required: true, trim: true }, // Subject name
  code: { type: String, required: true, unique: true, trim: true }, // Subject code
  externalMarks: { type: Number, required: true, min: 0, max: 60 },
});

// Models
const ExtMarks = mongoose.model('ExtMarks', extMarksSchema);
const IntMarks = mongoose.model('IntMarks', marksSchema);
const studentdetails = mongoose.model('studentdetails', studetails);
const Subject = mongoose.model("Subject", subjectSchema);
// Routes







// Routes















//Subject Details

// Get all subjects
app.get("/subjectdetails", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// Add a new subject
app.post("/subjectdetails", async (req, res) => {
  try {
    const { name, code } = req.body;
    const newSubject = new Subject({ name, code });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: "Failed to add subject", error });
  }
});

// Update a subject
app.put("/subjectdetails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name, code },
      { new: true, runValidators: true }
    );
    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subject", error });
  }
});

// Delete a subject
app.delete("/subjectdetails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subject", error });
  }
});


















//Internal Marks

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






app.get('/getinternalmarks', async (req, res) => {
  try {
    const marks = await IntMarks.find();
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marks', error });
  }
});










//External Marks


app.post('/addExternalMark', async (req, res) => {
  console.log('Incoming Data:', req.body); // Log the request body

  const { rollNo, studentName, name, code, externalMarks } = req.body;

  if (!rollNo || !studentName || !name || !code || externalMarks === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newMark = new ExtMarks({
      rollNo,
      studentName,
      name,
      code,
      externalMarks,
    });
    await newMark.save();
    res.status(200).json({ message: 'Marks saved successfully!' });
  } catch (err) {
    console.error('Error saving marks:', err);
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






















//Student Details

// Add student details
app.post('/studentdetails', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await studentdetails.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new studentdetails({ username, password });
    await newUser.save();

    // Send a JSON response
    res.status(201).json({
      message: 'User added successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user', error });
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









































// Aggregation route
app.get('/api/student-marks', async (req, res) => {
  try {
    const collection = mongoose.connection.collection('intmarks'); // Starting from intmarks

    const result = await collection.aggregate([
      // Join with studentdetails
      {
        $lookup: {
          from: 'studentdetails', // The collection name to join with
          localField: 'studentId', // The field in `intmarks`
          foreignField: '_id', // The field in `studentdetails`
          as: 'studentInfo', // Alias for the joined data
        },
      },
      {
        $unwind: '$studentInfo', // Flatten the array
      },
      // Join with subjectdetails
      {
        $lookup: {
          from: 'subjectdetails', // The collection name to join with
          localField: 'subjectId', // The field in `intmarks`
          foreignField: '_id', // The field in `subjectdetails`
          as: 'subjectInfo', // Alias for the joined data
        },
      },
      {
        $unwind: '$subjectInfo', // Flatten the array
      },
      // Join with extmarks
      {
        $lookup: {
          from: 'extmarks', // The collection name to join with
          localField: 'studentId', // The field in `intmarks`
          foreignField: 'studentId', // The field in `extmarks`
          as: 'externalMarks', // Alias for the joined data
        },
      },
      // Project fields to format the output
      {
        $project: {
          _id: 0,
          studentName: '$studentInfo.name',
          subjectName: '$subjectInfo.subjectName',
          internalMarks: '$marks', // Internal marks from intmarks
          externalMarks: { $arrayElemAt: ['$externalMarks.marks', 0] }, // Assuming one external mark per student/subject
        },
      },
    ]).toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});























// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
