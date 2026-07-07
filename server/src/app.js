import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import savingRoutes from './routes/savingRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/savings', dashboardRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/users', userRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "SavingGoals API is running"
  });
});

export default app;
