import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

const router = Router();

router.post('/', requireAuth, createTask);
router.get('/', requireAuth, listTasks);
router.get('/:id', requireAuth, getTask);
router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);

export default router;
