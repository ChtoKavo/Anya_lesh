import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';
import { hashPassword } from '../src/utils/hash.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_NICKNAME = process.env.ADMIN_NICKNAME || 'admin';

const TEACHER_EMAIL = process.env.TEACHER_EMAIL || 'teacher@example.com';
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'TeacherPass123';
const TEACHER_NAME = process.env.TEACHER_NAME || 'Teacher';
const TEACHER_NICKNAME = process.env.TEACHER_NICKNAME || 'teacher';

async function createUser({ email, password, name, nickname, role }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const passwordHash = await hashPassword(password);
    await pool.query(
      'UPDATE users SET password_hash = ?, role = ?, name = ?, nickname = ? WHERE id = ?',
      [passwordHash, role, name, nickname, existing[0].id]
    );
    return existing[0].id;
  }

  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    'INSERT INTO users (name, nickname, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, nickname, email, passwordHash, role]
  );

  const userId = result.insertId;
  await pool.query(
    'INSERT IGNORE INTO user_progress (user_id, level, xp, next_level_xp, coins, energy, max_energy) VALUES (?, 1, 0, 1000, 0, 100.00, 100.00)',
    [userId]
  );
  await pool.query(
    'INSERT IGNORE INTO pets (user_id, name, type, mood, level, xp, energy, max_energy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, nickname, 'teacher-pet', 'happy', 1, 0, 100.00, 100.00]
  );

  return userId;
}

(async () => {
  try {
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','owner_admin','teacher') NOT NULL DEFAULT 'user'");
    const [assigned] = await pool.query("SHOW COLUMNS FROM users LIKE 'assigned_teacher_id'");
    if (assigned.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN assigned_teacher_id BIGINT UNSIGNED NULL AFTER role');
      await pool.query('ALTER TABLE users ADD CONSTRAINT fk_users_assigned_teacher FOREIGN KEY (assigned_teacher_id) REFERENCES users(id) ON DELETE SET NULL');
    }
    const adminCreated = await createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      nickname: ADMIN_NICKNAME,
      role: 'admin',
    });

    if (adminCreated) {
      console.log('Created admin user id:', adminCreated);
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', ADMIN_PASSWORD);
    } else {
      console.log('Admin user already exists with email:', ADMIN_EMAIL);
    }

    const teacherCreated = await createUser({
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD,
      name: TEACHER_NAME,
      nickname: TEACHER_NICKNAME,
      role: 'teacher',
    });

    if (teacherCreated) {
      console.log('Created teacher user id:', teacherCreated);
      console.log('Email:', TEACHER_EMAIL);
      console.log('Password:', TEACHER_PASSWORD);
    } else {
      console.log('Teacher user already exists with email:', TEACHER_EMAIL);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin/teacher:', err.message);
    process.exit(1);
  }
})();
