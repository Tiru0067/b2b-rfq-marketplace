import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Allow frontend to communicate with this API
app.use(cors());

// Read incoming JSON request bodies
app.use(express.json());

// Health check route to verify server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'B2B RFQ Marketplace API is active',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/supplier', supplierRoutes);

// Handle unknown API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Central error handling middleware
app.use(errorHandler);

export default app;
