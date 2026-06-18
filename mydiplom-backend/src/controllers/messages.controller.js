import { pool } from '../config/db.js';

export async function ensureMessagesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      from_user_id BIGINT UNSIGNED NOT NULL,
      to_user_id BIGINT UNSIGNED NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_messages_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_messages_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_messages_from_to (from_user_id, to_user_id),
      INDEX idx_messages_to_from (to_user_id, from_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function getMessagesWithUser(req, res) {
  try {
    await ensureMessagesTable();
    const userId = req.user?.id;
    const friendId = parseInt(req.params.id, 10);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!friendId || friendId === userId) return res.status(400).json({ error: 'Invalid user id' });

    const [recipientRows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [friendId]);
    if (!recipientRows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [rows] = await pool.query(
      `SELECT id, from_user_id, to_user_id, text, created_at
       FROM messages
       WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
       ORDER BY created_at ASC
       LIMIT 100`,
      [userId, friendId, friendId, userId]
    );

    return res.json({ messages: rows || [] });
  } catch (err) {
    console.error('getMessagesWithUser error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}

export async function sendMessage(req, res) {
  try {
    const userId = req.user?.id;
    const { recipientId, text } = req.body;
    const toId = Number(recipientId);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!toId || toId === userId) return res.status(400).json({ error: 'Invalid recipient' });
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'Message text is required' });

    const [recipientRows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [toId]);
    if (!recipientRows.length) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM messages
       WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)`,
      [userId, toId, toId, userId]
    );

    if ((countRows[0]?.cnt || 0) >= 20) {
      return res.status(400).json({ error: 'Message limit reached for this conversation' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (from_user_id, to_user_id, text) VALUES (?, ?, ?)',
      [userId, toId, String(text).trim()]
    );

    const [rows] = await pool.query(
      'SELECT id, from_user_id, to_user_id, text, created_at FROM messages WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return res.json({ message: rows[0] });
  } catch (err) {
    console.error('sendMessage error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

export async function getAdminChats(req, res) {
  try {
    await ensureMessagesTable();

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

    if (!threads.length) {
      return res.json({ threads: [] });
    }

    const userIds = [...new Set(threads.flatMap(thread => [thread.user_a, thread.user_b]))];
    const placeholders = userIds.map(() => '?').join(', ');
    const [users] = userIds.length > 0
      ? await pool.query(
          `SELECT id, nickname, email FROM users WHERE id IN (${placeholders})`,
          userIds
        )
      : [ [] ];

    const usersById = Object.fromEntries(users.map(user => [user.id, user]));

    const enriched = threads.map(thread => {
      const participants = [usersById[thread.user_a], usersById[thread.user_b]].filter(Boolean);
      return {
        id: `${thread.user_a}_${thread.user_b}`,
        participants,
        participantIds: [thread.user_a, thread.user_b],
        title: participants.length === 2
          ? `${participants[0].nickname} ↔ ${participants[1].nickname}`
          : `Чат ${thread.user_a}_${thread.user_b}`,
        lastMessageAt: thread.last_message_at,
        messageCount: thread.message_count,
      };
    });

    return res.json({ threads: enriched });
  } catch (err) {
    console.error('getAdminChats error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load chats' });
  }
}

export async function getAdminChatThread(req, res) {
  try {
    await ensureMessagesTable();
    const threadId = req.params.id;
    if (!threadId || !threadId.includes('_')) {
      return res.status(400).json({ error: 'Invalid thread id' });
    }

    const [idA, idB] = threadId.split('_').map((value) => Number(value));
    if (!idA || !idB || idA === idB) {
      return res.status(400).json({ error: 'Invalid thread participants' });
    }

    const [messages] = await pool.query(
      `SELECT id, from_user_id, to_user_id, text, created_at
       FROM messages
       WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
       ORDER BY created_at ASC`,
      [idA, idB, idB, idA]
    );

    return res.json({ messages });
  } catch (err) {
    console.error('getAdminChatThread error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load thread messages' });
  }
}
