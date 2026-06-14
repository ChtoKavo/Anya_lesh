import { Router } from 'express';
import { login, register, getUsers, getTopUsers } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.get('/top', getTopUsers);

export default router;
