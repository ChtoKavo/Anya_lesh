import { pool } from '../src/config/db.js';

(async () => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, nickname FROM users WHERE email = ?', ['testuser@example.com']);
    console.log('DB rows:', rows);
    process.exit(0);
  } catch (err) {
    console.error('DB query failed:', err.message);
    process.exit(1);
  }
})();
