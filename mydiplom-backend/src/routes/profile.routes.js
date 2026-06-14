import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  me, 
  updateProfile, 
  changePassword, 
  updatePet 
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', verifyToken, me);
router.put('/update', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.put('/pet/:petId', verifyToken, updatePet);

export default router;
