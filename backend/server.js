const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  // Allow multiple URLs if separated by commas, or just a single URL
  if (process.env.FRONTEND_URL.includes(',')) {
    allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
  } else {
    allowedOrigins.push(process.env.FRONTEND_URL.trim());
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like server-to-server or postman/curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Builder API is running' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
