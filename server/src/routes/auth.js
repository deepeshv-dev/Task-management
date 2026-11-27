import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import { config, cookieOptions } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanText, validEmail } from '../utils/validation.js';

const router = Router();
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

function issueSession(user, res) {
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.cookie('session', token, cookieOptions);
}

router.post('/register', authLimit, asyncHandler(async (req, res) => {
  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email).toLowerCase();
  const password = req.body?.password;
  if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
  }
  if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  issueSession(user, res);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
}));

router.post('/login', authLimit, asyncHandler(async (req, res) => {
  const email = cleanText(req.body?.email).toLowerCase();
  const password = req.body?.password;
  if (!validEmail(email) || typeof password !== 'string') return res.status(400).json({ message: 'Enter your email and password.' });
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }
  issueSession(user, res);
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('session', { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax', path: '/' });
  res.status(204).end();
});

export default router;
