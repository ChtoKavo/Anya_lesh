import { pool } from '../config/db.js';

export async function getFriendsAndRequests(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Accepted friends: either requester->recipient accepted or recipient->requester accepted
    let friendsRows = [];
    try {
      const [rows] = await pool.query(
        `SELECT fr.id as request_id, fr.from_user_id, fr.to_user_id, fr.status, u.id as user_id, u.nickname, u.email, u.name
         FROM friend_requests fr
         JOIN users u ON u.id = CASE WHEN fr.from_user_id = ? THEN fr.to_user_id ELSE fr.from_user_id END
         WHERE (fr.from_user_id = ? OR fr.to_user_id = ?) AND fr.status = 'accepted'`,
        [userId, userId, userId]
      );
      friendsRows = rows;
    } catch (err) {
      // If the friend_requests table does not exist, return empty result sets instead of throwing 500
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ friends: [], incoming: [], outgoing: [] });
      }
      throw err;
    }

    // Incoming pending requests
    let incoming = [];
    let outgoing = [];
    try {
      const [incomingRows] = await pool.query(
        `SELECT fr.id as request_id, fr.from_user_id, fr.to_user_id, fr.status, u.id as requester_user_id, u.nickname, u.email, u.name
         FROM friend_requests fr
         JOIN users u ON fr.from_user_id = u.id
         WHERE fr.to_user_id = ? AND fr.status = 'pending'`,
        [userId]
      );
      incoming = incomingRows;

      const [outgoingRows] = await pool.query(
        `SELECT fr.id as request_id, fr.from_user_id, fr.to_user_id, fr.status, u.id as recipient_user_id, u.nickname, u.email, u.name
         FROM friend_requests fr
         JOIN users u ON fr.to_user_id = u.id
         WHERE fr.from_user_id = ? AND fr.status = 'pending'`,
        [userId]
      );
      outgoing = outgoingRows;
    } catch (err) {
      // If friend_requests table missing or other error, return empty arrays
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ friends: [], incoming: [], outgoing: [] });
      }
      throw err;
    }

    return res.json({ friends: friendsRows, incoming, outgoing });
  } catch (err) {
    console.error('getFriendsAndRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch friends' });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const requesterId = req.user?.id;
    const { recipientEmail, recipientId } = req.body;
    if (!requesterId) return res.status(401).json({ error: 'Unauthorized' });

    let recipient;
    if (recipientId) {
      const [rows] = await pool.query('SELECT id, email, nickname, name FROM users WHERE id = ?', [recipientId]);
      recipient = rows[0];
    } else if (recipientEmail) {
      const [rows] = await pool.query('SELECT id, email, nickname, name FROM users WHERE email = ?', [recipientEmail]);
      recipient = rows[0];
    }

    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
    if (recipient.id === requesterId) return res.status(400).json({ error: 'Cannot send request to yourself' });

    try {
      await pool.query('INSERT INTO friend_requests (from_user_id, to_user_id, status) VALUES (?, ?, ?)', [requesterId, recipient.id, 'pending']);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Request already exists' });
      }
      throw err;
    }

    return res.json({ message: 'Request sent' });
  } catch (err) {
    console.error('sendFriendRequest error:', err);
    return res.status(500).json({ error: 'Failed to send request' });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const userId = req.user?.id;
    const { requestId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure the request exists and recipient is current user
    const [rows] = await pool.query('SELECT * FROM friend_requests WHERE id = ?', [requestId]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    const request = rows[0];
    if (request.to_user_id !== userId) return res.status(403).json({ error: 'Not allowed' });

    await pool.query('UPDATE friend_requests SET status = ? WHERE id = ?', ['accepted', requestId]);
    return res.json({ message: 'Accepted' });
  } catch (err) {
    console.error('acceptFriendRequest error:', err);
    return res.status(500).json({ error: 'Failed to accept' });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const userId = req.user?.id;
    const { requestId, block } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [rows] = await pool.query('SELECT * FROM friend_requests WHERE id = ?', [requestId]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    const request = rows[0];
    if (request.to_user_id !== userId && request.from_user_id !== userId) return res.status(403).json({ error: 'Not allowed' });

    await pool.query('UPDATE friend_requests SET status = ? WHERE id = ?', ['rejected', requestId]);

    // Если указано блокировать, добавим запись в user_blocks
    if (block) {
      try {
        await pool.query(`CREATE TABLE IF NOT EXISTS user_blocks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          blocker_id INT NOT NULL,
          blocked_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_block (blocker_id, blocked_id)
        ) ENGINE=InnoDB`);

        const [reqRow] = await pool.query('SELECT from_user_id, to_user_id FROM friend_requests WHERE id = ?', [requestId]);
        const r = reqRow[0] || {};
        const otherId = r.from_user_id === userId ? r.to_user_id : r.from_user_id;
        await pool.query('INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)', [userId, otherId]);
        // Also remove any existing friend_requests between users
        await pool.query('DELETE FROM friend_requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)', [userId, otherId, otherId, userId]);
      } catch (e) {
        console.error('block on reject failed', e.message || e);
      }
    }

    return res.json({ message: 'Rejected' });
  } catch (err) {
    console.error('rejectFriendRequest error:', err);
    return res.status(500).json({ error: 'Failed to reject' });
  }
}

export async function blockUser(req, res) {
  try {
    const userId = req.user?.id;
    const { blockedId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!blockedId) return res.status(400).json({ error: 'blockedId required' });

    await pool.query(`CREATE TABLE IF NOT EXISTS user_blocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blocker_id INT NOT NULL,
      blocked_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_block (blocker_id, blocked_id)
    ) ENGINE=InnoDB`);

    await pool.query('INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)', [userId, blockedId]);
    // remove relationships
    await pool.query('DELETE FROM friend_requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)', [userId, blockedId, blockedId, userId]);

    return res.json({ message: 'Blocked' });
  } catch (err) {
    console.error('blockUser error', err);
    return res.status(500).json({ error: 'Failed to block user' });
  }
}

export async function unblockUser(req, res) {
  try {
    const userId = req.user?.id;
    const blockedId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!blockedId) return res.status(400).json({ error: 'blockedId required' });

    await pool.query('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?', [userId, blockedId]);
    return res.json({ message: 'Unblocked' });
  } catch (err) {
    console.error('unblockUser error', err);
    return res.status(500).json({ error: 'Failed to unblock user' });
  }
}

export async function removeFriend(req, res) {
  try {
    const userId = req.user?.id;
    const friendId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Remove any friend_request rows between the two users
    await pool.query('DELETE FROM friend_requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)', [userId, friendId, friendId, userId]);
    return res.json({ message: 'Removed' });
  } catch (err) {
    console.error('removeFriend error:', err);
    return res.status(500).json({ error: 'Failed to remove friend' });
  }
}
