import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Task', taskSchema);
