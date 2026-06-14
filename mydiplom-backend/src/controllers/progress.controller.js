import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureGameStateTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS user_game_state (
    user_id INT PRIMARY KEY,
    state TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
}

export async function getLevelContent(req, res) {
  try {
    const level = Number(req.params.level);
    const isGame = String(req.query.game || 'false').toLowerCase() === 'true';
    const lite = String(req.query.lite || 'false').toLowerCase() === 'true';

    if (isGame) {
      const contentPath = path.resolve(__dirname, '..', '..', '..', 'mydiplom', 'content', 'game_levels.json');
      const allData = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
      const levelData = allData.find((item) => Number(item.level) === level);
      if (!levelData) {
        return res.status(404).json({ error: 'Game level not found' });
      }
      return res.json(levelData);
    }

    const contentPath = path.resolve(__dirname, '..', '..', '..', 'mydiplom', 'content', `level_${level}.json`);
    const raw = JSON.parse(await fs.readFile(contentPath, 'utf-8'));

    if (lite) {
      const maxItems = Number(req.query.maxItems || 6);
      const safe = {
        level: raw.level,
        title: raw.title,
        min_correct_percent: raw.min_correct_percent,
        stages: Array.isArray(raw.stages) ? raw.stages.map((st) => ({
          id: st.id,
          title: st.title,
          type: st.type,
          exercises: st.exercises || [],
          items: Array.isArray(st.items) ? st.items.slice(0, maxItems).map((it) => {
            if (typeof it === 'string') return it;
            // remove potential media paths to keep payload small
            const copy = { ...it };
            delete copy.sound;
            delete copy.image;
            delete copy.assets;
            return copy;
          }) : [],
          itemsCount: Array.isArray(st.items) ? st.items.length : 0
        })) : []
      };
      return res.json(safe);
    }

    return res.json(raw);
  } catch (err) {
    console.error('getLevelContent error', err.message);
    return res.status(500).json({ error: 'Failed to load level content' });
  }
}

export async function getGameLevels(req, res) {
  try {
    const contentPath = path.resolve(__dirname, '..', '..', '..', 'mydiplom', 'content', 'game_levels.json');
    const allData = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
    const list = allData.map((item) => ({
      level: item.level,
      name: item.name,
      pairCount: Array.isArray(item.pairs) ? item.pairs.length : 0,
      description: item.description || ''
    }));
    return res.json(list);
  } catch (err) {
    console.error('getGameLevels error', err.message);
    return res.status(500).json({ error: 'Failed to load game levels' });
  }
}

export async function getGameState(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    await ensureGameStateTable();
    const [rows] = await pool.query('SELECT state FROM user_game_state WHERE user_id = ? LIMIT 1', [user_id]);
    const state = rows[0]?.state ? JSON.parse(rows[0].state) : null;
    return res.json({ state });
  } catch (err) {
    console.error('getGameState error', err.message);
    return res.status(500).json({ error: 'Failed to load game state' });
  }
}

export async function saveGameState(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const state = req.body?.state || {};
    await ensureGameStateTable();

    const [existing] = await pool.query('SELECT user_id FROM user_game_state WHERE user_id = ? LIMIT 1', [user_id]);
    const jsonState = JSON.stringify(state);

    if (existing.length > 0) {
      await pool.query('UPDATE user_game_state SET state = ?, updated_at = NOW() WHERE user_id = ?', [jsonState, user_id]);
    } else {
      await pool.query('INSERT INTO user_game_state (user_id, state) VALUES (?, ?)', [user_id, jsonState]);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('saveGameState error', err.message);
    return res.status(500).json({ error: 'Failed to save game state' });
  }
}

export async function getTodayTasks(req, res) {
  try {
    // Prefer authenticated user id, fallback to query param
    const userId = req.user?.id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });

    // get user current level if available
    const [uRows] = await pool.query('SELECT id, current_level FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = uRows[0];
    const level = user?.current_level || 1;

    // load content and trim to lightweight representation
    const contentPath = path.resolve(__dirname, '..', '..', '..', 'mydiplom', 'content', `level_${level}.json`);
    const raw = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
    const maxItems = 6;
    const data = {
      level: raw.level,
      title: raw.title || raw.level,
      min_correct_percent: raw.min_correct_percent || 70,
      stages: Array.isArray(raw.stages) ? raw.stages.map((st) => ({
        id: st.id,
        title: st.title,
        type: st.type,
        exercises: st.exercises || [],
        items: Array.isArray(st.items) ? st.items.slice(0, maxItems).map((it) => {
          if (typeof it === 'string') return it;
          const copy = { ...it };
          delete copy.sound;
          delete copy.image;
          delete copy.assets;
          return copy;
        }) : [],
        itemsCount: Array.isArray(st.items) ? st.items.length : 0
      })) : []
    };

    // fetch user_stats to find completed stages
    const [stats] = await pool.query('SELECT stage_id, correct_percent FROM user_stats WHERE user_id = ?', [userId]);
    const completed = {};
    stats.forEach((s) => { completed[s.stage_id] = s.correct_percent; });

    const nextStage = data.stages.find((st) => {
      const pct = completed[st.id];
      return !(pct >= (data.min_correct_percent || 70));
    }) || data.stages[0];

    // return lightweight response (no media)
    const resp = {
      level: data.level,
      levelTitle: data.title,
      stage: { id: nextStage.id, title: nextStage.title, type: nextStage.type, exercises: nextStage.exercises || [] }
    };

    return res.json(resp);
  } catch (err) {
    console.error('getTodayTasks error', err.message);
    return res.status(500).json({ error: 'Failed to load today tasks' });
  }
}

export async function submitAnswer(req, res) {
  const body = req.body || {};
  const user_id = req.user?.id || body.user_id;
  const task_id = body.task_id ?? 0;
  const { answer_text, is_correct = false, time_spent_seconds = 0, stage_id } = body;

  if (!user_id || !stage_id) {
    return res.status(400).json({ error: 'user_id (auth) and stage_id are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert answer; include stage_id if column exists
    const [cols] = await conn.query("SHOW COLUMNS FROM user_answers");
    const colNames = cols.map((c) => c.Field);

    if (colNames.includes('stage_id')) {
      const insertSql = `INSERT INTO user_answers (user_id, task_id, stage_id, answer_text, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?, ?)`;
      await conn.query(insertSql, [user_id, task_id, stage_id, answer_text, is_correct ? 1 : 0, time_spent_seconds]);
    } else {
      const insertSql = `INSERT INTO user_answers (user_id, task_id, answer_text, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?)`;
      await conn.query(insertSql, [user_id, task_id, answer_text, is_correct ? 1 : 0, time_spent_seconds]);
    }

    // Aggregate totals for this user and stage (if stage_id present, aggregate by stage)
    let aggSql;
    let aggParams;
    if (colNames.includes('stage_id')) {
      aggSql = `SELECT COUNT(*) AS total, SUM(is_correct) AS correct, SUM(time_spent_seconds) AS time_spent FROM user_answers WHERE user_id = ? AND stage_id = ?`;
      aggParams = [user_id, stage_id];
    } else {
      aggSql = `SELECT COUNT(*) AS total, SUM(is_correct) AS correct, SUM(time_spent_seconds) AS time_spent FROM user_answers WHERE user_id = ?`;
      aggParams = [user_id];
    }
    const [rows] = await conn.query(aggSql, aggParams);
    const total = rows[0].total || 0;
    const correct = rows[0].correct || 0;
    const timeSpent = rows[0].time_spent || 0;
    const correctPercent = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

    // Upsert into user_stats
    const findSql = `SELECT id FROM user_stats WHERE user_id = ? AND stage_id = ? LIMIT 1`;
    const [found] = await conn.query(findSql, [user_id, stage_id]);
    if (found.length > 0) {
      const updateSql = `UPDATE user_stats SET correct_percent = ?, attempts = ?, time_spent_seconds = ?, last_attempt_at = NOW() WHERE id = ?`;
      await conn.query(updateSql, [correctPercent, total, timeSpent, found[0].id]);
    } else {
      const insertStat = `INSERT INTO user_stats (user_id, stage_id, correct_percent, attempts, time_spent_seconds, last_attempt_at) VALUES (?, ?, ?, ?, ?, NOW())`;
      await conn.query(insertStat, [user_id, stage_id, correctPercent, total, timeSpent]);
    }

    await conn.commit();
    return res.json({ ok: true, correctPercent, total, correct });
  } catch (err) {
    await conn.rollback();
    console.error('submitAnswer error', err.message);
    return res.status(500).json({ error: 'Failed to save answer' });
  } finally {
    conn.release();
  }
}

export async function advanceLevel(req, res) {
  const body = req.body || {};
  const user_id = req.user?.id || body.user_id;
  const level = body.level;
  if (!user_id || !level) return res.status(400).json({ error: 'user_id (auth) and level required' });

  try {
    const nextLevel = parseInt(level, 10) + 1;
    // update both users.current_level and user_progress.level to keep single source of truth
    await pool.query('UPDATE users SET current_level = ?, current_stage = ? WHERE id = ?', [nextLevel, '1-1', user_id]);
    await pool.query('UPDATE user_progress SET level = ? WHERE user_id = ?', [nextLevel, user_id]);
    return res.json({ ok: true, nextLevel });
  } catch (err) {
    console.error('advanceLevel error', err.message);
    return res.status(500).json({ error: 'Failed to advance level' });
  }
}

export async function getUserStats(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(400).json({ error: 'auth required' });

    const [uRows] = await pool.query('SELECT id, current_level FROM users WHERE id = ? LIMIT 1', [user_id]);
    const user = uRows[0];
    const level = user?.current_level || 1;

    // load level content to compute words count for completed stages
    let data = { stages: [], min_correct_percent: 70, level };
    try {
      const contentPath = path.resolve(__dirname, '..', '..', '..', 'mydiplom', 'content', `level_${level}.json`);
      data = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
    } catch (e) {
      // fallback to defaults
    }

    const [stats] = await pool.query('SELECT stage_id, correct_percent, last_attempt_at FROM user_stats WHERE user_id = ?', [user_id]);

    const minPct = data.min_correct_percent || 70;
    const completedStageIds = stats.filter(s => (s.correct_percent || 0) >= minPct).map(s => s.stage_id);

    let wordsCount = 0;
    if (Array.isArray(data.stages)) {
      data.stages.forEach(st => {
        if (completedStageIds.includes(st.id) && Array.isArray(st.items)) {
          wordsCount += st.items.length;
        }
      });
    }

    // active days: distinct dates from last_attempt_at in user_stats
    const daySet = new Set();
    stats.forEach(s => {
      if (s.last_attempt_at) {
        const d = new Date(s.last_attempt_at).toISOString().slice(0, 10);
        daySet.add(d);
      }
    });

    return res.json({ level, levelTitle: data.title || `Level ${level}`, wordsLearned: wordsCount, activeDays: daySet.size });
  } catch (err) {
    console.error('getUserStats error', err.message);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
