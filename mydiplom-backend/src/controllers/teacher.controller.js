import { pool } from '../config/db.js';

export async function getAssignedStudents(req, res) {
  try {
    const teacherId = req.user.id;

    const [students] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.nickname,
        u.email,
        u.role,
        u.last_seen,
        IF(u.assigned_teacher_id = ?, 1, 0) AS is_assigned,
        COALESCE(up.level, 1) AS level,
        COALESCE(up.xp, 0) AS xp,
        COALESCE(up.coins, 0) AS coins,
        COALESCE(up.energy, 100.00) AS energy,
        COALESCE(up.words_learned_total, 0) AS words_learned_total,
        COALESCE(up.streak_days, 0) AS streak_days,
        COALESCE(p.name, u.nickname) AS pet_name
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN pets p ON u.id = p.user_id
      WHERE u.role = 'user' AND u.is_active = 1
      ORDER BY is_assigned DESC, u.nickname ASC`,
      [teacherId]
    );

    return res.json({ students });
  } catch (err) {
    console.error('getAssignedStudents error:', err.message, err.stack);
    return res.status(500).json({ error: 'Failed to load students', details: err.message, stack: err.stack });
  }
}

export async function assignStudentToTeacher(req, res) {
  try {
    const teacherId = req.user.id;
    const studentId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      'SELECT id, role, assigned_teacher_id FROM users WHERE id = ? LIMIT 1',
      [studentId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];
    const isAdmin = ['admin', 'owner_admin'].includes(req.user.role);

    if (student.role !== 'user') {
      return res.status(400).json({ error: 'Cannot assign this account as a student' });
    }

    if (student.assigned_teacher_id && student.assigned_teacher_id !== teacherId && !isAdmin) {
      return res.status(403).json({ error: 'Student уже назначен другому учителю' });
    }

    await pool.query(
      'UPDATE users SET assigned_teacher_id = ? WHERE id = ?',
      [teacherId, studentId]
    );

    return res.json({ message: 'Student assigned successfully' });
  } catch (err) {
    console.error('assignStudentToTeacher error:', err.message);
    return res.status(500).json({ error: 'Failed to assign student' });
  }
}

export async function getStudentDetails(req, res) {
  try {
    const teacherId = req.user.id;
    const studentId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.nickname,
        u.email,
        u.role,
        u.assigned_teacher_id,
        u.current_level,
        u.current_stage,
        u.created_at,
        COALESCE(up.level, 1) AS level,
        COALESCE(up.xp, 0) AS xp,
        COALESCE(up.coins, 0) AS coins,
        COALESCE(up.energy, 100.00) AS energy,
        COALESCE(up.max_energy, 100.00) AS max_energy,
        COALESCE(up.words_learned_total, 0) AS words_learned_total,
        COALESCE(up.streak_days, 0) AS streak_days,
        COALESCE(p.name, u.nickname) AS pet_name,
        COALESCE(p.type, 'default') AS pet_type,
        COALESCE(p.mood, 'happy') AS pet_mood,
        COALESCE(p.level, 1) AS pet_level,
        COALESCE(p.xp, 0) AS pet_xp
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN pets p ON u.id = p.user_id
      WHERE u.id = ? AND u.role = 'user'
      LIMIT 1`,
      [studentId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];
    const isAdmin = ['admin', 'owner_admin'].includes(req.user.role);

    if (student.assigned_teacher_id && student.assigned_teacher_id !== teacherId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied to this student' });
    }

    const [stats] = await pool.query(
      'SELECT stage_id, correct_percent, attempts, time_spent_seconds, last_attempt_at FROM user_stats WHERE user_id = ?',
      [studentId]
    );

    const [notes] = await pool.query(
      `SELECT id, note, created_at
      FROM teacher_notes
      WHERE student_id = ? AND teacher_id = ?
      ORDER BY created_at DESC`,
      [studentId, teacherId]
    );

    const [answers] = await pool.query(
      `SELECT id, task_id, stage_id, answer_text, is_correct, time_spent_seconds, created_at
      FROM user_answers
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20`,
      [studentId]
    );

    return res.json({ student, stats, notes, answers });
  } catch (err) {
    console.error('getStudentDetails error:', err.message, err.stack);
    return res.status(500).json({ error: 'Failed to load student details', details: err.message, stack: err.stack });
  }
}

export async function addTeacherNote(req, res) {
  try {
    const teacherId = req.user.id;
    const studentId = parseInt(req.params.id, 10);
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const [rows] = await pool.query('SELECT assigned_teacher_id FROM users WHERE id = ? AND role = "user" LIMIT 1', [studentId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];
    const isAdmin = ['admin', 'owner_admin'].includes(req.user.role);

    if (student.assigned_teacher_id && student.assigned_teacher_id !== teacherId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied to this student' });
    }

    await pool.query(
      'INSERT INTO teacher_notes (teacher_id, student_id, note) VALUES (?, ?, ?)',
      [teacherId, studentId, note.trim()]
    );

    return res.json({ message: 'Note saved' });
  } catch (err) {
    console.error('addTeacherNote error:', err.message);
    return res.status(500).json({ error: 'Failed to save note' });
  }
}
