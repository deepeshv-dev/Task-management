import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid.' });
    req.user = user;
    next();
  } catch {
    res.clearCookie('session');
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}
