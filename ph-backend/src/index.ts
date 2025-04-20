import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/authRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import templateRoutes from './routes/templateRoutes'; // Separate router for templates

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://yash3699:Yash3699@cluster0.fmpir.mongodb.net/Auth?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  // Allow multiple origins - development, deployed Vercel, and any portfolio subdomains
  origin: function(origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',                 // Local development frontend
      'http://localhost:3001',                 // Alt local development frontend
      'https://portfolio-hub-client.vercel.app', // Vercel deployment
      'https://portfolio-hub.vercel.app'       // Another possible Vercel deployment
    ];

    // Allow any subdomain of vercel.app
    if (origin && (origin.includes('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('portfoliohub.com'))) {
      callback(null, true);
      return;
    }

    // Check against explicit allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log the blocked origin for debugging
      console.log('CORS blocked request from origin:', origin);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/templates', templateRoutes); // Use separate router for templates

// Simple health check endpoint
app.get('/api/healthcheck', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Handle undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
