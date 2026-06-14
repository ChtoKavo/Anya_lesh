import { pool } from './src/config/db.js';

async function debug() {
  try {
    console.log('Querying messages table...');
    const [threads] = await pool.query(
      `SELECT
        LEAST(from_user_id, to_user_id) AS user_a,
        GREATEST(from_user_id, to_user_id) AS user_b,
        MAX(created_at) AS last_message_at,
        COUNT(*) AS message_count
      FROM messages
      GROUP BY user_a, user_b
      ORDER BY last_message_at DESC
      LIMIT 50`
    );
    console.log('threads count', threads.length);
    console.log('threads sample', threads.slice(0, 5));
    const userIds = [...new Set(threads.flatMap(thread => [thread.user_a, thread.user_b]))];
    console.log('userIds', userIds);
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(', ');
      console.log('querying users with placeholders', placeholders);
      const [users] = await pool.query(`SELECT id, nickname, email FROM users WHERE id IN (${placeholders})`, userIds);
      console.log('users count', users.length);
      console.log('users sample', users.slice(0, 5));
    }
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    process.exit(0);
  }
}

debug();
