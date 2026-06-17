import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

export async function me(req, res) {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let user = null;
    try {
      console.log('profile.me: running user SELECT');
      const [userRows] = await pool.query(
        'SELECT id, name, nickname, email, role, avatar, created_at, last_seen FROM users WHERE id = ?',
        [userId]
      );
      user = userRows && userRows[0] ? userRows[0] : null;
    } catch (qErr) {
      console.error('profile.me user SELECT error:', qErr);
      throw qErr;
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    let progress = {};
    try {
      console.log('profile.me: running progress SELECT');
      const [progressRows] = await pool.query(
        'SELECT level, xp, next_level_xp, coins, energy, words_learned_total, streak_days FROM user_progress WHERE user_id = ?',
        [userId]
      );
      progress = progressRows && progressRows[0] ? progressRows[0] : {};
    } catch (qErr) {
      console.error('profile.me progress SELECT error:', qErr);
      throw qErr;
    }

    let pets = [];
    try {
      console.log('profile.me: running pets SELECT');
      const [petsRows] = await pool.query(
        'SELECT id, name, type, level, xp, mood FROM pets WHERE user_id = ?',
        [userId]
      );
      pets = petsRows || [];
    } catch (qErr) {
      console.error('profile.me pets SELECT error:', qErr);
      throw qErr;
    }

    const userWithPetName = {
      ...user,
      pets: pets || [],
    };

    // Compute global rank for users (only role='user')
    let rank = null;
    try {
      console.log('profile.me: running rank SELECT (count-based)');
      const currentXp = progress.xp || 0;
      const currentLevel = progress.level || 0;
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as higher FROM users u LEFT JOIN user_progress up ON u.id = up.user_id
         WHERE u.is_active = 1 AND u.role = 'user' AND (
           COALESCE(up.xp,0) > ? OR (COALESCE(up.xp,0) = ? AND COALESCE(up.level,0) > ?)
         )`,
        [currentXp, currentXp, currentLevel]
      );
      if (countRows && countRows.length > 0) rank = countRows[0].higher + 1;
    } catch (e) {
      console.error('profile.me rank SELECT error (ignored):', e && e.message ? e.message : e);
    }

    return res.json({ user: { ...userWithPetName, global_rank: rank }, progress });
  } catch (err) {
    console.error('me controller error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}

// Обновить профиль пользователя
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email, nickname, avatar } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updates.push('name = ?');
      values.push(trimmedName);
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email cannot be empty' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [normalizedEmail, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updates.push('email = ?');
      values.push(normalizedEmail);
    }

    if (nickname !== undefined) {
      const trimmedNickname = String(nickname).trim();
      if (!trimmedNickname) {
        return res.status(400).json({ error: 'Nickname cannot be empty' });
      }
      updates.push('nickname = ?');
      values.push(trimmedNickname);
      
      // Также обновить имя первого питомца пользователя, если он есть
      try {
        await pool.query(
          'UPDATE pets SET name = ? WHERE user_id = ?',
          [trimmedNickname, userId]
        );
      } catch (petErr) {
        console.error('Failed to update pet name during profile update:', petErr);
        // Не прерываем основной процесс обновления профиля
      }
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    const [userRows] = await pool.query(
      'SELECT id, name, nickname, email, role, avatar FROM users WHERE id = ?',
      [userId]
    );

    return res.json({ user: userRows[0], message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Изменить пароль
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [[user]] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}

// Обновить питомца
export async function updatePet(req, res) {
  try {
    const userId = req.user.id;
    const { petId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }

    // Проверить, что питомец принадлежит пользователю
    const [[pet]] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    await pool.query(
      'UPDATE pets SET name = ? WHERE id = ?',
      [name, petId]
    );

    const [[updatedPet]] = await pool.query(
      'SELECT id, name, type, level, xp, mood FROM pets WHERE id = ?',
      [petId]
    );

    return res.json({ pet: updatedPet, message: 'Pet updated' });
  } catch (err) {
    console.error('updatePet error:', err);
    return res.status(500).json({ error: 'Failed to update pet' });
  }
}
