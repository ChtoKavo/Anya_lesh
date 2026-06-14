import { pool } from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        from_user_id BIGINT UNSIGNED NOT NULL,
        to_user_id BIGINT UNSIGNED NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_messages_from_to (from_user_id, to_user_id),
        KEY idx_messages_to_from (to_user_id, from_user_id),
        CONSTRAINT fk_messages_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_messages_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('messages table ensured');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create messages table:', err?.message || err);
    process.exit(1);
  }
}

run();
