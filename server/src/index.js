import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import profileRoutes from './routes/profile.js';
import dashboardRoutes from './routes/dashboard.js';

if (!config.mongoUri) throw new Error('MONGODB_URI must be configured.');
if (!config.jwtSecret || config.jwtSecret.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters.');

await mongoose.connect(config.mongoUri);
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong. Please try again.' });
});

app.listen(config.port, () => console.log(`Task API listening on http://localhost:${config.port}`));
