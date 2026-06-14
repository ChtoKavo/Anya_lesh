import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';
import { hashPassword } from '../src/utils/hash.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const users = [
  { name: 'Alice Ivanova', nickname: 'alice', email: 'alice@test.local', password: 'Alice123!' , level:1 },
  { name: 'Bob Petrov', nickname: 'bob', email: 'bob@test.local', password: 'Bob123!' , level:2 },
  { name: 'Carol Sidor', nickname: 'carol', email: 'carol@test.local', password: 'Carol123!' , level:1 }
];

(async () => {
  try {
    for (const u of users) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length > 0) {
        console.log('User already exists:', u.email);
        continue;
      }

      const passwordHash = await hashPassword(u.password);

      // detect columns in users table
      const [cols] = await pool.query("SHOW COLUMNS FROM users");
      const colNames = cols.map((c) => c.Field);

      const insertCols = ['name', 'nickname', 'email', 'password_hash', 'role'];
      const insertValues = [u.name, u.nickname, u.email, passwordHash, 'user'];

      if (colNames.includes('current_level')) {
        insertCols.push('current_level');
        insertValues.push(u.level || 1);
      }
      if (colNames.includes('current_stage')) {
        insertCols.push('current_stage');
        insertValues.push('1-1');
      }

      const placeholders = insertCols.map(() => '?').join(', ');
      const sql = `INSERT INTO users (${insertCols.join(', ')}) VALUES (${placeholders})`;
      const [result] = await pool.query(sql, insertValues);

      // insert initial stats row if table exists
      const [statCols] = await pool.query("SHOW TABLES LIKE 'user_stats'");
      if (statCols.length > 0) {
        await pool.query(
          'INSERT INTO user_stats (user_id, stage_id, correct_percent, attempts, time_spent_seconds, last_attempt_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [result.insertId, '1-1', 0, 0, 0]
        );
      }

      console.log('Created user:', u.email, 'password:', u.password);
    }

    console.log('Test users creation finished.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create test users:', err.message);
    process.exit(1);
  }
})();
