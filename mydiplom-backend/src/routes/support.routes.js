import { Router } from 'express';
import {
  sendSupportRequest,
  getUserSupportRequests,
  getAllSupportRequests,
  respondToSupportRequest,
  closeSupportRequest
} from '../controllers/support.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// User routes
router.post('/request', sendSupportRequest);
router.get('/requests/:userId', getUserSupportRequests);

// Admin routes
router.get('/all', isAdmin, getAllSupportRequests);
router.post('/respond', isAdmin, respondToSupportRequest);
router.put('/close/:id', isAdmin, closeSupportRequest);

export default router;
