import { Router } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cleanText } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);
const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in-progress', 'completed'];

function taskInput(body, partial = false) {
  const input = {};
  if (!partial || body.title !== undefined) {
    input.title = cleanText(body.title);
    if (!input.title || input.title.length > 140) throw Object.assign(new Error('Task title is required and must be 140 characters or fewer.'), { status: 400 });
  }
  if (!partial || body.description !== undefined) {
    input.description = cleanText(body.description || '');
    if (input.description.length > 2000) throw Object.assign(new Error('Description must be 2,000 characters or fewer.'), { status: 400 });
  }
  if (!partial || body.priority !== undefined) {
    input.priority = body.priority || 'medium';
    if (!priorities.includes(input.priority)) throw Object.assign(new Error('Choose a valid priority.'), { status: 400 });
  }
  if (!partial || body.status !== undefined) {
    input.status = body.status || 'todo';
    if (!statuses.includes(input.status)) throw Object.assign(new Error('Choose a valid status.'), { status: 400 });
  }
  if (!partial || body.dueDate !== undefined) {
    if (body.dueDate === '' || body.dueDate === null || body.dueDate === undefined) input.dueDate = null;
    else {
      input.dueDate = new Date(body.dueDate);
      if (Number.isNaN(input.dueDate.getTime())) throw Object.assign(new Error('Enter a valid due date.'), { status: 400 });
    }
  }
  return input;
}

router.get('/', asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };
  if (statuses.includes(req.query.status)) filter.status = req.query.status;
  if (priorities.includes(req.query.priority)) filter.priority = req.query.priority;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
    filter.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
  }
  const sort = req.query.sort === 'dueDate' ? { dueDate: 1, createdAt: -1 } : { createdAt: -1 };
  const [tasks, grouped] = await Promise.all([
    Task.find(filter).sort(sort).limit(200).lean(),
    Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);
  const statusCounts = { all: 0, todo: 0, 'in-progress': 0, completed: 0 };
  for (const group of grouped) {
    statusCounts[group._id] = group.count;
    statusCounts.all += group.count;
  }
  res.json({ tasks, statusCounts });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id }).lean();
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
}));

router.post('/', asyncHandler(async (req, res) => {
  const task = await Task.create({ ...taskInput(req.body || {}), user: req.user.id });
  res.status(201).json({ task });
}));

const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: taskInput(req.body || {}, true) },
    { new: true, runValidators: true },
  );
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
});

router.put('/:id', updateTask);
router.patch('/:id', updateTask);

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.status(204).end();
}));

export default router;
