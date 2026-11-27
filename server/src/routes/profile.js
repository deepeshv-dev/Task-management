import { Router } from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanText, validEmail } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const [user, taskCount] = await Promise.all([
    User.findById(req.user.id),
    Task.countDocuments({ user: req.user.id }),
  ]);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    taskCount,
  });
}));

router.put('/', asyncHandler(async (req, res) => {
  const name = cleanText(req.body?.name);
  const email = cleanText(req.body?.email).toLowerCase();
  if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  const duplicate = await User.exists({ email, _id: { $ne: req.user.id } });
  if (duplicate) return res.status(409).json({ message: 'That email address is already in use.' });
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { name, email } },
    { new: true, runValidators: true },
  );
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}));

export default router;
