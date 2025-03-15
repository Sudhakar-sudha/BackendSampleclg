require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://sudhakar:sudhakar@cluster0.odnra1b.mongodb.net/Tancet?retryWrites=true&w=majority&appName=Cluster0 " , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("Userquiz", userSchema);




// User Result Schema
const UserResultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  totalScore: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  unanswered: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const UserResult = mongoose.model("UserResult", UserResultSchema);



// // Schema for storing user responses
const UserResponseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  questionId: { type: Number, required: true },
  selectedOption: { type: String, required: false ,  default: null },
});

const UserResponse = mongoose.model("UserResponse", UserResponseSchema);




const CorrectAnswerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true, unique: true },
  correctOption: { type: String, required: true },
});

const CorrectAnswer = mongoose.model("CorrectAnswer", CorrectAnswerSchema);


// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already registered" });
      }
  const newUser = new User({ username, password });
  await newUser.save();

  res.json({ message: "User registered successfully" });
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: "Invalid username or password" });

   // Directly compare passwords (Insecure for production use)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
  res.json({ message: "Login successful" ,username: user.username });
});



// Get All Users (Admin)
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Add User (Admin)
app.post("/users", async (req, res) => {
  const { username, password } = req.body;

  const newUser = new User({ username, password });
  await newUser.save();

  res.json({ message: "User added successfully" });
});

// Update User (Admin)
app.put("/users/:id", async (req, res) => {
  const { username, password } = req.body;

  await User.findByIdAndUpdate(req.params.id, { username, password });
  res.json({ message: "User updated successfully" });
});

// Delete User (Admin)
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received request to delete user with ID:", id);

    // Find user and get their username
    const user = await User.findById(id);
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    const username = user.username; // Fetch username before deleting
    console.log("Deleting user:", user);

    // Delete user from User collection
    await User.findByIdAndDelete(id);

    // Delete related data using username
    await UserResult.deleteOne({ username });
    await UserResponse.deleteMany({ username });

    console.log("User and related data deleted successfully");
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});







app.post("/api/submit", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging log

    const { username, selectedOption } = req.body; // Ensure correct variable name

    // Validate request data
    if (!username || typeof selectedOption !== "object") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Prevent duplicate submissions
    const existingSubmission = await UserResponse.findOne({ username });
    if (existingSubmission) {
      return res.status(400).json({ error: "You have already submitted the quiz." });
    }

    // Ensure all questions have responses (store null if unanswered)
    const totalQuestions = 100; // Adjust based on actual count
    const responseArray = Array.from({ length: totalQuestions }, (_, i) => ({
      username,
      questionId: i + 1,
      selectedOption: selectedOption[i + 1] ?? null, // Ensure default value
    }));

    // Validate that `selectedOption` is not undefined
    if (responseArray.some((response) => response.selectedOption === undefined)) {
      return res.status(400).json({ error: "Invalid response data: selectedOption missing." });
    }

    // Insert responses into database
    await UserResponse.insertMany(responseArray);
    res.json({ message: "Responses saved successfully" });

  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ error: "Error saving responses" });
  }
});


app.get("/api/check-submission", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const existingSubmission = await UserResponse.findOne({ username });

    if (existingSubmission) {
      return res.json({ alreadySubmitted: true });
    } else {
      return res.json({ alreadySubmitted: false });
    }
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ error: "Error checking submission status" });
  }
});

 

// API to store correct answers
app.post("/api/set-answers", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const answerArray = Object.entries(answers).map(([questionId, correctOption]) => ({
      questionId: parseInt(questionId),
      correctOption,
    }));

    console.log(answerArray);

    // Delete old answers and insert new ones
    await CorrectAnswer.deleteMany({});
    await CorrectAnswer.insertMany(answerArray);

    res.json({ message: "Correct answers saved successfully!" });
  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ error: "Error saving correct answers" });
  }
});




// API: Evaluate User Quiz Score and Store Result with Negative Marking
app.get("/api/evaluate/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch user responses and correct answers
    const userResponses = await UserResponse.find({ username });
    const correctAnswers = await CorrectAnswer.find();

    if (userResponses.length === 0) {
      return res.status(404).json({ error: "No responses found for this user." });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalQuestions = correctAnswers.length;

    correctAnswers.forEach((question) => {
      const userResponse = userResponses.find(
        (resp) => parseInt(resp.questionId) === parseInt(question.questionId)
      );
      if (!userResponse || userResponse.selectedOption === null) {
        unansweredCount++; // If response is null or doesn't exist, it's unanswered
      } else if (userResponse.selectedOption === question.correctOption) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    // Calculate total score with negative marking (1 wrong answer = -0.25)
    let totalScore = correctCount - wrongCount * 0.25;
    totalScore = Math.max(totalScore, 0); // Ensure score does not go below zero

    // Save User Result in MongoDB
    const userResult = await UserResult.findOneAndUpdate(
      { username },
      {
        totalScore,
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      username,
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      score: `${totalScore} / ${totalQuestions}`,
      result: userResult,
    });
  } catch (error) {
    console.error("❌ Error evaluating result:", error);
    res.status(500).json({ error: "Error evaluating result" });
  }
});

// 📌 API to Get All Student Results
app.get("/api/students", async (req, res) => {
  try {
    const students = await UserResult.find().sort({ totalScore: -1 }); // Sort by highest score
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Error fetching student results" });
  }
});


// 🗑️ API to Delete a Student Result & Responses
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the student result by ID
    const userResult = await UserResult.findById(id);
    if (!userResult) {
      return res.status(404).json({ error: "Student result not found" });
    }

    // Delete UserResult
    await UserResult.findByIdAndDelete(id);

    // Delete related UserResponses
    await UserResponse.deleteMany({ username: userResult.username });

    res.json({ message: "Student result and responses deleted successfully" });
  } catch (error) {
    console.error("Error deleting student data:", error);
    res.status(500).json({ error: "Error deleting student data" });
  }
});


app.get("/api/result", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const userResponses = await UserResponse.find({ username });

    if (!userResponses.length) {
      return res.status(404).json({ message: "No quiz data found for this user." });
    }

    const correctAnswers = userResponses.filter((resp) => resp.isCorrect).length;
    const totalQuestions = userResponses.length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = correctAnswers; // Adjust scoring as needed

    res.json({ username, score, correctAnswers, incorrectAnswers, totalQuestions });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ message: "Error fetching quiz results" });
  }
});



// Route to get total registered user count
app.get("/user-count", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ totalUsers: userCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// API to get the count of users who submitted responses
app.get("/api/quiz-submissions/count", async (req, res) => {
  try {
    const userCount = await UserResponse.distinct("username").countDocuments();
     // Divide by 100 and round to 2 decimal places
     const scaledCount = (userCount / 100);

     res.json({ totalUsersCompleted: scaledCount });
  } catch (error) {
    console.error("Error fetching submission count:", error);
    res.status(500).json({ error: "Error fetching submission count" });
  }
});



// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
