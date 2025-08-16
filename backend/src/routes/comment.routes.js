import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addComment, listComments } from '../controllers/comment.controller.js';

const router = Router();

router.post('/:id/comments', requireAuth, addComment);
router.get('/:id/comments', requireAuth, listComments);

export default router;
