import { Router } from 'express';
import { 
  getAllUsers, 
  getUserDetails, 
  getRanking, 
  deleteUser, 
  changeUserRole,
  getAdminStats 
} from '../controllers/users.controller.js';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getShopItems,
  createShopItem,
  updateShopItem,
  deleteShopItem,
  reorderRanking,
  banUser,
  unbanUser,
  getUserInactivity,
  sendAdminMessage,
} from '../controllers/users.controller.js';
import { getAdminChats, getAdminChatThread } from '../controllers/messages.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', getAdminStats);
router.get('/all', getAllUsers);
router.get('/user/:id', getUserDetails);
router.get('/ranking', getRanking);
router.post('/ranking/reorder', reorderRanking);
router.get('/chats', getAdminChats);
router.get('/chats/:id', getAdminChatThread);
// Teachers
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);
// Shop
router.get('/shop', getShopItems);
router.post('/shop', createShopItem);
router.put('/shop/:id', updateShopItem);
router.delete('/shop/:id', deleteShopItem);
// Ban / unban
router.post('/ban', banUser);
router.delete('/ban/:id', unbanUser);
// Inactivity and admin messages
router.get('/user/:id/inactivity', getUserInactivity);
router.post('/message', sendAdminMessage);
router.delete('/user/:id', deleteUser);
router.post('/user/role', changeUserRole);

export default router;
