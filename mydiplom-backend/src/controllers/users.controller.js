import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Получить всех пользователей (только для админа)
export async function getAllUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.name, 
        u.nickname, 
        u.email, 
        u.role,
        u.created_at,
        u.is_active,
        COALESCE(p.name, '') as pet_name,
        COALESCE(p.level, 1) as pet_level,
        COALESCE(up.level, 1) as user_level,
        COALESCE(up.coins, 0) as coins,
        COALESCE(up.words_learned_total, 0) as words_learned
      FROM users u
      LEFT JOIN pets p ON u.id = p.user_id
      LEFT JOIN user_progress up ON u.id = up.user_id
      ORDER BY u.created_at DESC`
    );
    
    return res.json({ users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Получить информацию о пользователе (для админ панели)
export async function getUserDetails(req, res) {
  try {
    const userId = req.params.id;
    
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.name,
        u.nickname, 
        u.email, 
        u.role,
        u.created_at,
        u.is_active,
        COALESCE(up.level, 1) as level,
        COALESCE(up.xp, 0) as xp,
        COALESCE(up.coins, 0) as coins,
        COALESCE(up.words_learned_total, 0) as words_learned,
        COALESCE(up.streak_days, 0) as streak_days
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [pets] = await pool.query(
      `SELECT id, name, type, mood, level, xp, energy FROM pets WHERE user_id = ?`,
      [userId]
    );

    // Compute global rank among users (only role='user') without window functions
    let rank = null;
    try {
      const currentXp = users[0].xp || 0;
      const currentLevel = users[0].level || 0;
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as higher FROM users u LEFT JOIN user_progress up ON u.id = up.user_id
         WHERE u.is_active = 1 AND u.role = 'user' AND (
           COALESCE(up.xp,0) > ? OR (COALESCE(up.xp,0) = ? AND COALESCE(up.level,0) > ?)
         )`,
        [currentXp, currentXp, currentLevel]
      );
      rank = (countRows && countRows[0]) ? countRows[0].higher + 1 : null;
    } catch (e) {
      console.error('compute rank error:', e);
    }

    return res.json({ user: { ...users[0], global_rank: rank }, pets });
  } catch (err) {
    console.error('getUserDetails error:', err);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
}

// Получить рейтинг (топ 5 + развернуть)
export async function getRanking(req, res) {
  try {
    console.log('getRanking: handler entered');
    const limit = parseInt(req.query.limit || 5, 10);
    const offset = parseInt(req.query.offset || 0, 10);

    // Получить рейтинг пользователей (без window functions)
    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.nickname,
        COALESCE(up.level, 1) as level,
        COALESCE(up.coins, 0) as coins,
        COALESCE(up.xp, 0) as xp,
        COALESCE(up.words_learned_total, 0) as words_learned,
        COALESCE(p.name, '') as pet_name,
        COALESCE(p.type, 'default') as pet_type,
        COALESCE(p.level, 1) as pet_level
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN pets p ON u.id = p.user_id
      WHERE u.is_active = 1 AND u.role = 'user'
      ORDER BY COALESCE(up.xp,0) DESC, COALESCE(up.level,0) DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    console.log('getRanking: rows fetched', Array.isArray(rows) ? rows.length : typeof rows);
    const rankings = rows.map((r, idx) => ({ ...r, rank: offset + idx + 1 }));
    console.log('getRanking: computed rankings length', rankings.length);
    return res.json({ rankings });
  } catch (err) {
    console.error('getRanking error:', err && err.message, err && err.code);
    if (err && err.sql) console.error('SQL:', err.sql);
    if (err && err.stack) console.error(err.stack);
    // Return detailed error for debugging
    return res.status(500).json({ error: err.message || 'Failed to fetch ranking', code: err.code, sql: err.sql });
  }
}

// Удалить пользователя (мягкое удаление)
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    
    // Проверить, что это не последний админ
    const [admins] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
    );

    const [targetUser] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (!targetUser.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser[0].role === 'admin' && admins[0].count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }

    // Мягкое удаление
    await pool.query(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [userId]
    );

    return res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Изменить роль пользователя
export async function changeUserRole(req, res) {
  try {
    const { userId, role } = req.body;
    
    if (!['user', 'admin', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    return res.json({ message: 'Role updated' });
  } catch (err) {
    console.error('changeUserRole error:', err);
    return res.status(500).json({ error: 'Failed to update role' });
  }
}

// Получить статистику админ панели
export async function getAdminStats(req, res) {
  try {
    const [totalUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
    );

    const [totalPets] = await pool.query(
      'SELECT COUNT(*) as count FROM pets'
    );

    let totalSupportRequests;
    try {
      [totalSupportRequests] = await pool.query(
        'SELECT COUNT(*) as count FROM support_requests WHERE status IN ("open", "in_progress")'
      );
    } catch (err) {
      // If the support_requests table doesn't exist, treat as zero open requests
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        totalSupportRequests = [{ count: 0 }];
      } else {
        throw err;
      }
    }

    const [topUsers] = await pool.query(
      `SELECT 
        u.id, 
        u.nickname,
        COALESCE(up.level, 1) as level,
        COALESCE(up.xp, 0) as xp
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.is_active = 1 AND u.role = 'user'
      ORDER BY up.xp DESC
      LIMIT 5`
    );

    return res.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalPets: totalPets[0].count,
        openSupportRequests: totalSupportRequests[0].count,
      },
      topUsers,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}

// --- New admin helpers ---
export async function getTeachers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, nickname, email, created_at, is_active FROM users WHERE role = 'teacher' ORDER BY created_at DESC`
    );
    return res.json({ teachers: rows });
  } catch (err) {
    console.error('getTeachers error:', err);
    return res.status(500).json({ error: 'Failed to fetch teachers' });
  }
}

export async function createTeacher(req, res) {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const nickname = (name || email.split('@')[0]).replace(/\s+/g, '_');
    const rawPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, nickname, email, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
      [name || nickname, nickname, email, passwordHash, 'teacher']
    );
    return res.json({ teacher: { id: result.insertId, name, email, password: rawPassword } });
  } catch (err) {
    console.error('createTeacher error:', err);
    return res.status(500).json({ error: 'Failed to create teacher' });
  }
}

export async function updateTeacher(req, res) {
  try {
    const teacherId = req.params.id;
    const { name, email } = req.body;
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ? AND role = "teacher"', [name, email, teacherId]);
    return res.json({ message: 'Teacher updated' });
  } catch (err) {
    console.error('updateTeacher error:', err);
    return res.status(500).json({ error: 'Failed to update teacher' });
  }
}

export async function deleteTeacher(req, res) {
  try {
    const teacherId = req.params.id;
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ? AND role = "teacher"', [teacherId]);
    return res.json({ message: 'Teacher deactivated' });
  } catch (err) {
    console.error('deleteTeacher error:', err);
    return res.status(500).json({ error: 'Failed to delete teacher' });
  }
}

// Shop endpoints: ensure simple table exists and perform CRUD
async function ensureShopTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS shop_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price INT DEFAULT 0,
      metadata JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

export async function getShopItems(req, res) {
  try {
    await ensureShopTable();
    const [rows] = await pool.query('SELECT * FROM shop_items ORDER BY id');
    return res.json({ items: rows });
  } catch (err) {
    console.error('getShopItems error:', err);
    return res.status(500).json({ error: 'Failed to fetch shop items' });
  }
}

export async function createShopItem(req, res) {
  try {
    await ensureShopTable();
    const { name, price, metadata } = req.body;
    const [result] = await pool.query('INSERT INTO shop_items (name, price, metadata) VALUES (?, ?, ?)', [name, price || 0, JSON.stringify(metadata || {})]);
    return res.json({ itemId: result.insertId });
  } catch (err) {
    console.error('createShopItem error:', err);
    return res.status(500).json({ error: 'Failed to create shop item' });
  }
}

export async function updateShopItem(req, res) {
  try {
    await ensureShopTable();
    const itemId = req.params.id;
    const { name, price, metadata } = req.body;
    await pool.query('UPDATE shop_items SET name = ?, price = ?, metadata = ? WHERE id = ?', [name, price || 0, JSON.stringify(metadata || {}), itemId]);
    return res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateShopItem error:', err);
    return res.status(500).json({ error: 'Failed to update shop item' });
  }
}

export async function deleteShopItem(req, res) {
  try {
    await ensureShopTable();
    const itemId = req.params.id;
    await pool.query('DELETE FROM shop_items WHERE id = ?', [itemId]);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteShopItem error:', err);
    return res.status(500).json({ error: 'Failed to delete shop item' });
  }
}

// Reorder ranking: store positions into admin_ranking table
async function ensureRankingTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS admin_ranking (
      user_id INT PRIMARY KEY,
      position INT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

export async function reorderRanking(req, res) {
  try {
    const { order } = req.body; // array of userIds
    if (!Array.isArray(order)) return res.status(400).json({ error: 'Order must be array' });
    await ensureRankingTable();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < order.length; i++) {
        const userId = order[i];
        await conn.query('INSERT INTO admin_ranking (user_id, position) VALUES (?, ?) ON DUPLICATE KEY UPDATE position = VALUES(position)', [userId, i + 1]);
      }
      await conn.commit();
    } finally {
      conn.release();
    }
    return res.json({ message: 'Ranking reordered' });
  } catch (err) {
    console.error('reorderRanking error:', err);
    return res.status(500).json({ error: 'Failed to reorder ranking' });
  }
}

// Ban / Unban
async function ensureBansTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS bans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      admin_id INT NULL,
      reason VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

export async function banUser(req, res) {
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await ensureBansTable();
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
    await pool.query('INSERT INTO bans (user_id, admin_id, reason) VALUES (?, ?, ?)', [userId, req.user?.id || null, reason || null]);
    return res.json({ message: 'User banned' });
  } catch (err) {
    console.error('banUser error:', err);
    return res.status(500).json({ error: 'Failed to ban user' });
  }
}

export async function unbanUser(req, res) {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [userId]);
    await pool.query('DELETE FROM bans WHERE user_id = ?', [userId]);
    return res.json({ message: 'User unbanned' });
  } catch (err) {
    console.error('unbanUser error:', err);
    return res.status(500).json({ error: 'Failed to unban user' });
  }
}

export async function getUserInactivity(req, res) {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query('SELECT COALESCE(up.streak_days,0) as daysPlayed, u.last_seen FROM users u LEFT JOIN user_progress up ON u.id = up.user_id WHERE u.id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const r = rows[0];
    const daysAbsent = r.last_seen ? Math.floor((Date.now() - new Date(r.last_seen).getTime()) / (1000*60*60*24)) : null;
    return res.json({ daysPlayed: r.daysPlayed, daysAbsent });
  } catch (err) {
    console.error('getUserInactivity error:', err);
    return res.status(500).json({ error: 'Failed to get inactivity' });
  }
}

export async function sendAdminMessage(req, res) {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });
    // from admin user
    const fromId = req.user?.id || null;
    await pool.query('INSERT INTO messages (from_user_id, to_user_id, text) VALUES (?, ?, ?)', [fromId, userId, text]);
    return res.json({ message: 'sent' });
  } catch (err) {
    console.error('sendAdminMessage error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
