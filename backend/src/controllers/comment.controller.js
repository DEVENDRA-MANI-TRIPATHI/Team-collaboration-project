import mongoose from 'mongoose';
import Comment from '../models/comment.model.js';
import Task from '../models/task.model.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const canSeeTask = (user, task) =>
  user?.role === 'admin' || task.createdBy.equals(user._id) || task.assignedTo.equals(user._id);

// POST /tasks/:id/comments
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid task ID' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!canSeeTask(req.user, task)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { text } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'text is required' });
    }

    const comment = await Comment.create({
      text: String(text),
      taskId: task._id,
      userId: req.user._id,
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to add comment' });
  }
};

// GET /tasks/:id/comments?page=&limit=
export const listComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid task ID' });

    // Optional but recommended: ensure the task exists and user can see it
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!canSeeTask(req.user, task)) return res.status(403).json({ message: 'Forbidden' });

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Comment.find({ taskId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Comment.countDocuments({ taskId: id }),
    ]);

    return res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('listComments error:', error);
    return res.status(500).json({ message: error.message || 'Failed to list comments' });
  }
};
