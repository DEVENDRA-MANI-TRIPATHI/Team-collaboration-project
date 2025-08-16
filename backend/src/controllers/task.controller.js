import mongoose from 'mongoose';
import Task from '../models/task.model.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canSeeTask = (user, task) =>
  user?.role === 'admin' ||
  task.createdBy.equals(user._id) ||
  task.assignedTo.equals(user._id);

const canDeleteTask = (user, task) =>
  user?.role === 'admin' || task.createdBy.equals(user._id);


export const createTask = async (req, res) => {
  try {
    const { title, description = '', assignedTo } = req.body || {};

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'title and assignedTo are required' });
    }
    if (!isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: 'assignedTo must be a valid ID' });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: String(description),
      status: 'pending',
      createdBy: req.user._id,
      assignedTo,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create task' });
  }
};

export const listTasks = async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      createdBy,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const isAdmin = req.user?.role === 'admin';

    const visibility = isAdmin
      ? {}
      : { $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };

    const q = { ...visibility };

    if (status) q.status = status;
    if (assignedTo && isValidObjectId(assignedTo)) q.assignedTo = assignedTo;
    if (createdBy && isValidObjectId(createdBy)) q.createdBy = createdBy;

    if (search && String(search).trim()) {
      q.title = { $regex: String(search).trim(), $options: 'i' };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Task.find(q).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(q),
    ]);

    return res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('listTasks error:', error);
    return res.status(500).json({ message: error.message || 'Failed to list tasks' });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!canSeeTask(req.user, task)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json(task);
  } catch (error) {
    console.error('getTask error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get task' });
  }
};


export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!canSeeTask(req.user, task)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, description, status, assignedTo } = req.body || {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: 'title cannot be empty' });
      }
      task.title = String(title).trim();
    }

    if (description !== undefined) {
      task.description = String(description);
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: "status must be 'pending' or 'completed'" });
      }
      task.status = status;
    }

    if (assignedTo !== undefined) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({ message: 'assignedTo must be a valid ID' });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();

    return res.json(task);
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update task' });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!canDeleteTask(req.user, task)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await task.deleteOne();
    return res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete task' });
  }
};
