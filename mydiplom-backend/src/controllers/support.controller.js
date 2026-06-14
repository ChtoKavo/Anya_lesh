import { pool } from '../config/db.js';

// Отправить запрос в поддержку
export async function sendSupportRequest(req, res) {
  try {
    const { userId, subject, category, message, priority = 'normal' } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO support_requests (user_id, subject, category, message, priority, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, subject, category, message, priority, 'open']
    );

    return res.json({ 
      id: result.insertId,
      message: 'Support request submitted successfully' 
    });
  } catch (err) {
    console.error('sendSupportRequest error:', err);
    return res.status(500).json({ error: 'Failed to submit support request' });
  }
}

// Получить запросы в поддержку пользователя
export async function getUserSupportRequests(req, res) {
  try {
    const userId = req.params.userId;

    const [requests] = await pool.query(
      `SELECT 
        id, 
        subject, 
        category, 
        message, 
        status, 
        priority,
        response_message,
        created_at,
        updated_at
      FROM support_requests
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ requests });
  } catch (err) {
    console.error('getUserSupportRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch support requests' });
  }
}

// Получить все запросы в поддержку (для админа)
export async function getAllSupportRequests(req, res) {
  try {
    const status = req.query.status;
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    let query = `
      SELECT 
        sr.id, 
        sr.subject, 
        sr.category, 
        sr.message, 
        sr.status, 
        sr.priority,
        sr.response_message,
        sr.created_at,
        sr.updated_at,
        u.id as user_id,
        u.nickname,
        u.email
      FROM support_requests sr
      JOIN users u ON sr.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE sr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [requests] = await pool.query(query, params);

    return res.json({ requests });
  } catch (err) {
    console.error('getAllSupportRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch support requests' });
  }
}

// Ответить на запрос в поддержку (для админа)
export async function respondToSupportRequest(req, res) {
  try {
    const { requestId, response, status = 'resolved' } = req.body;
    const adminId = req.user?.id;

    if (!response) {
      return res.status(400).json({ error: 'Response message is required' });
    }

    await pool.query(
      `UPDATE support_requests 
       SET response_message = ?, status = ?, admin_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [response, status, adminId, requestId]
    );

    return res.json({ message: 'Support request updated' });
  } catch (err) {
    console.error('respondToSupportRequest error:', err);
    return res.status(500).json({ error: 'Failed to update support request' });
  }
}

// Закрыть запрос в поддержку
export async function closeSupportRequest(req, res) {
  try {
    const requestId = req.params.id;

    await pool.query(
      `UPDATE support_requests SET status = 'closed', updated_at = NOW() WHERE id = ?`,
      [requestId]
    );

    return res.json({ message: 'Support request closed' });
  } catch (err) {
    console.error('closeSupportRequest error:', err);
    return res.status(500).json({ error: 'Failed to close support request' });
  }
}
