import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

// Import routes
import projectRoutes from './routes/projects';
import channelRoutes from './routes/channels';
import contributionRoutes from './routes/contributions';
import githubRoutes from './routes/github';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/github', githubRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

export { prisma };

