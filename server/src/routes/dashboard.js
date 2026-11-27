import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const user = req.user._id;
  const now = new Date();
  const [groups, overdue, recentTasks] = await Promise.all([
    Task.aggregate([
      { $match: { user } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ user, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
    Task.find({ user }).sort({ updatedAt: -1 }).limit(5).lean(),
  ]);
  const counts = { total: 0, todo: 0, inProgress: 0, completed: 0 };
  for (const group of groups) {
    counts.total += group.count;
    if (group._id === 'todo') counts.todo = group.count;
    if (group._id === 'in-progress') counts.inProgress = group.count;
    if (group._id === 'completed') counts.completed = group.count;
  }
  res.json({ stats: { ...counts, overdue }, recentTasks });
}));

export default router;
