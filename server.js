// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // For environment variables

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow cross-origin requests from React Native
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobapp'; // Replace with your MongoDB Atlas URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String }, // Optional image URL
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);

// Routes

// GET: Fetch all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET: Fetch a single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST: Create a new job
app.post('/api/jobs', async (req, res) => {
  const { title, company, location, salary, description, category, image } = req.body;
  try {
    const newJob = new Job({
      title,
      company,
      location,
      salary,
      description,
      category,
      image,
    });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// PUT: Update an existing job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated document
    );
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE: Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Seed initial data (optional, for testing)
const seedData = async () => {
  const existingJobs = await Job.countDocuments();
  if (existingJobs === 0) {
    const initialJobs = [
      {
        title: 'Senior React Native Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: '$120,000 - $150,000',
        description: 'Develop cutting-edge mobile applications using React Native.',
        category: 'Tech',
        image: 'https://via.placeholder.com/300x150?text=TechCorp',
      },
      {
        title: 'Marketing Manager',
        company: 'GrowEasy',
        location: 'New York, NY',
        salary: '$90,000 - $110,000',
        description: 'Lead marketing campaigns and strategies.',
        category: 'Marketing',
        image: 'https://via.placeholder.com/300x150?text=GrowEasy',
      },
    ];
    await Job.insertMany(initialJobs);
    console.log('Initial job data seeded');
  }
};

// Start server and seed data
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedData(); // Seed data on server start (optional)
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Job App Backend!');
});
