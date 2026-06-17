import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export async function register(req, res) {
  const { petName, nickname, email, password } = req.body;
  if (!petName || !nickname || !email || !password) {
    return res.status(400).json({ message: 'Не заполнены обязательные поля' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Email уже используется' });
    }

    const passwordHash = await hashPassword(password);
    
    // Создать пользователя
    const [result] = await connection.query(
      'INSERT INTO users (name, nickname, email, password_hash) VALUES (?, ?, ?, ?)',
      [nickname.trim(), nickname.trim(), normalizedEmail, passwordHash]
    );

    const userId = result.insertId;

    // Вставляем или обновляем прогресс (может уже существовать из-за триггера)
    await connection.query(
      `INSERT INTO user_progress (user_id, level, xp, next_level_xp, coins, energy, max_energy, streak_days, words_learned_total) 
       VALUES (?, 1, 0, 1000, 0, 100.00, 100.00, 0, 0)
       ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`,
      [userId]
    );

    // Вставляем или обновляем питомца (может уже существовать из-за триггера, поэтому обновляем имя)
    await connection.query(
      `INSERT INTO pets (user_id, name, type, mood, level, xp, energy, max_energy) 
       VALUES (?, ?, 'default', 'happy', 1, 0, 100.00, 100.00)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [userId, petName.trim()]
    );

    await connection.commit();

    const user = {
      id: userId,
      name: nickname.trim(),
      petName: petName.trim(),
      email: normalizedEmail,
      role: 'user',
    };

    return res.json({ token: signToken(user), user });

  } catch (err) {
    await connection.rollback();
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Ошибка при регистрации', error: err.message });
  } finally {
    connection.release();
  }
}

export async function getUsers(req, res) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.nickname, u.email, u.role,
      COALESCE(p.name, u.nickname) as petName,
      COALESCE(up.level, '1') AS level,
      COALESCE(up.coins, 0) AS coins,
      COALESCE(up.words_learned_total, 0) AS words,
      COALESCE(up.streak_days, 0) AS streak
    FROM users u
    LEFT JOIN pets p ON u.id = p.user_id
    LEFT JOIN user_progress up ON u.id = up.user_id
    ORDER BY u.created_at DESC`
  );

  return res.json({ users: rows });
}

export async function getTopUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.nickname, u.email,
        COALESCE(up.level, 1) AS level,
        COALESCE(up.coins, 0) AS coins,
        COALESCE(up.words_learned_total, 0) AS words_learned_total,
        COALESCE(p.name, u.nickname) AS petName
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      LEFT JOIN pets p ON u.id = p.user_id
      WHERE u.is_active = 1 AND u.role = 'user'
      ORDER BY up.level DESC, up.coins DESC, up.words_learned_total DESC
      LIMIT 3`
    );

    return res.json({ top: rows });
  } catch (err) {
    console.error('getTopUsers error', err.message);
    return res.status(500).json({ error: 'Failed to load top users' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Введите email и пароль' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const [rows] = await pool.query(
    'SELECT id, name, nickname, email, role, avatar, password_hash FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (!rows.length) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const userRow = rows[0];
  const ok = await comparePassword(password, userRow.password_hash);
  if (!ok) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  // Получить имя персонажа из таблицы pets
  const [pets] = await pool.query('SELECT name FROM pets WHERE user_id = ? LIMIT 1', [userRow.id]);
  const petName = pets.length > 0 ? pets[0].name : userRow.nickname;

  try {
    await pool.query(
      'UPDATE users SET last_seen = NOW(), inactive_notification_type = ?, inactive_notified_at = NULL WHERE id = ?',
      ['none', userRow.id]
    );
  } catch (lastSeenError) {
    console.error('Failed to update last_seen on login:', lastSeenError);
  }

  const user = {
    id: userRow.id,
    name: userRow.name,
    petName: petName,
    email: userRow.email,
    role: userRow.role,
    avatar: userRow.avatar || null,
  };

  return res.json({ token: signToken(user), user });
}
