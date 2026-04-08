import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Learning Intelligence Engine is running' });
});

// Start server immediately so frontend doesn't hang
app.listen(PORT, () => {
  console.log(`🚀 Learning Intelligence Engine listening on port ${PORT}`);
});

// Database connection async
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Server running without Database. Check MongoDB Atlas Network Access IP.');
  });

// Auto-triggering nodemon restart
