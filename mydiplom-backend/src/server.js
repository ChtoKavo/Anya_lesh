import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';
import { processInactivityNotifications } from './inactivity.js';

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM user_progress LIKE 'inventory'");
    if (!columns.length) {
      await pool.query('ALTER TABLE user_progress ADD COLUMN inventory JSON NULL');
      console.log('Added inventory column to user_progress');
    }
  } catch (err) {
    console.warn('Could not ensure inventory column exists on user_progress:', err.message || err);
  }
  await pool.query('SELECT 1');
  // Ensure every user has a corresponding user_progress row
  try {
    await pool.query(`
      INSERT INTO user_progress (user_id, level, xp, next_level_xp, coins, energy, max_energy, streak_days, words_learned_total)
      SELECT u.id, 1, 0, 1000, 0, 100.00, 100.00, 0, 0
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE up.user_id IS NULL
    `);
    console.log('Ensured user_progress rows for all users');
  } catch (e) {
    console.error('Failed to ensure user_progress rows:', e.message);
  }
  app.listen(port, () => {
    console.log(`Backend started at http://localhost:${port}`);
  });
  

  // Запустить проверку неактивности сразу и затем каждые 15 минут
  processInactivityNotifications().catch(err => console.error('Inactivity checker failed:', err));
  setInterval(() => {
    processInactivityNotifications().catch(err => console.error('Inactivity checker failed:', err));
  }, 15 * 60 * 1000);
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error.message);
  process.exit(1);
});
