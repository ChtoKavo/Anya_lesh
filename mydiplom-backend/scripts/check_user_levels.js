import { pool } from '../src/config/db.js';

async function run() {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.current_level, up.level AS progress_level
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      ORDER BY u.created_at DESC
      LIMIT 20
    `);
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
