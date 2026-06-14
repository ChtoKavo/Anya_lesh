import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { isAuthenticated } from '../middleware/admin.js';
import { getFriendsAndRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, unblockUser } from '../controllers/friends.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', getFriendsAndRequests);
router.post('/request', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/reject', rejectFriendRequest);
router.post('/block', blockUser);
router.delete('/block/:id', unblockUser);
router.delete('/:id', removeFriend);

export default router;
