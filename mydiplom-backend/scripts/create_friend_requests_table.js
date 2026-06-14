import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        from_user_id BIGINT UNSIGNED NOT NULL,
        to_user_id BIGINT UNSIGNED NOT NULL,
        status ENUM('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        responded_at DATETIME DEFAULT NULL,
        UNIQUE KEY uq_friend_request_once (from_user_id, to_user_id, status),
        KEY idx_friend_requests_to (to_user_id),
        KEY idx_friend_requests_status (status),
        CONSTRAINT fk_friend_requests_from FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_friend_requests_to FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('friend_requests table ensured');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create friend_requests table:', err.message || err);
    process.exit(1);
  }
}

run();
