import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getLevelContent,
  getGameLevels,
  getTodayTasks,
  submitAnswer,
  advanceLevel,
  getUserStats,
  getGameState,
  saveGameState,
  syncProgress,
  getPublicRanking
} from '../controllers/progress.controller.js';

const router = express.Router();

router.get('/content/level/:level', getLevelContent);
router.get('/content/game-levels', getGameLevels);
router.get('/ranking', getPublicRanking);
router.get('/game-state', auth, getGameState);
router.post('/game-state', auth, saveGameState);
router.get('/today', auth, getTodayTasks);
router.get('/stats', auth, getUserStats);
router.post('/answer', auth, submitAnswer);
router.post('/advance', auth, advanceLevel);
router.post('/sync', auth, syncProgress);

export default router;
