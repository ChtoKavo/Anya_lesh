import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;

    try {
      await pool.query(
        'UPDATE users SET last_seen = NOW(), inactive_notification_type = ?, inactive_notified_at = NULL WHERE id = ?',
        ['none', payload.id]
      );
    } catch (updateError) {
      console.error('Failed to update last_seen for user:', updateError);
    }

    return next();
  } catch {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}

// Alias for consistency
export const verifyToken = auth;
