// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/cases', require('./routes/cases'));
// app.use('/api/analytics', require('./routes/analytics'));

// Basic health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API Online', service: 'IntelliShare Backend' });
});

// Database Connection (Mocked for this file, would connect to MongoDB)
const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected (Simulated)');
  } catch (err) {
    console.error('Database connection failed');
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
