import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMessagesWithUser, sendMessage } from '../controllers/messages.controller.js';

const router = Router();
router.use(verifyToken);

router.get('/with/:id', getMessagesWithUser);
router.post('/', sendMessage);

export default router;
